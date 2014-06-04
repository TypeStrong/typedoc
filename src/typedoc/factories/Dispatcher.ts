module TypeDoc.Factories
{
    export interface IScriptSnapshot
    {
        getText(start:number, end:number):string;
        getLineNumber(position:number):number;
    }


    /**
     * Create a type instance for the given symbol.
     *
     * @param symbol  The TypeScript symbol the type should point to.
     */
    export function createType(symbol:TypeScript.PullTypeSymbol):Models.BaseType
    {
        if (symbol instanceof TypeScript.PullStringConstantTypeSymbol) {
            return new Models.StringConstantType(symbol.name);
        } else if (symbol instanceof TypeScript.PullPrimitiveTypeSymbol) {
            return new Models.NamedType(symbol.getDisplayName());
        }

        return new Models.LateResolvingType(symbol);

        /*
         if (symbol instanceof TypeScript.PullErrorTypeSymbol)
         if (symbol instanceof TypeScript.PullTypeAliasSymbol)
         if (symbol instanceof TypeScript.PullTypeParameterSymbol)
         if (symbol instanceof TypeScript.PullTypeSymbol)
         */
    }


    /**
     * The central dispatcher receives documents from the compiler and emits
     * events for all discovered declarations.
     *
     * Factories should listen to the events emitted by the dispatcher. Each event
     * contains a state object describing the current state the dispatcher is in. Factories
     * can alter the state or stop it from being further processed.
     *
     * While the compiler is active, it passes documents to the dispatcher. Each document
     * will create an ´enterDocument´ event. By stopping the generated state, factories can
     * prevent entire documents from being processed.
     *
     * The dispatcher will iterate over all declarations and its children in the document
     * and yields a child state for them. For each of this states an ´enterDeclaration´ event
     * will be emitted. By stopping the child state, factories can prevent declarations from
     * being processed.
     *
     * - enterDocument
     *   - enterDeclaration
     *   - mergeReflection / createReflection
     *   - process
     *   - **Recursion**
     */
    export class Dispatcher extends EventDispatcher
    {
        /**
         * The project instance this dispatcher should push the created reflections to.
         */
        project:Models.ProjectReflection;

        compiler:TypeDoc.Application;

        idMap:{[id:number]:Models.DeclarationReflection} = {};

        snapshots:{[fileName:string]:IScriptSnapshot} = {};

        /**
         * A list of known factories.
         */
        static FACTORIES:any[] = [];


        /**
         * Create a new Dispatcher instance.
         *
         * @param project  The target project instance.
         */
        constructor(project:Models.ProjectReflection, compiler:TypeDoc.Application) {
            super();
            this.project  = project;
            this.compiler = compiler;

            Dispatcher.FACTORIES.forEach((factory) => {
                new factory(this)
            });
        }


        /**
         * Return the snapshot of the given filename.
         *
         * @param fileName  The filename of the snapshot.
         */
        getSnapshot(fileName:string):IScriptSnapshot {
            if (!this.snapshots[fileName]) {
                var snapshot:TypeScript.IScriptSnapshot;
                var lineMap:TypeScript.LineMap;

                this.snapshots[fileName] = {
                    getText: (start:number, end:number):string => {
                        if (!snapshot) snapshot = this.compiler.getScriptSnapshot(fileName);
                        return snapshot.getText(start, end);
                    },
                    getLineNumber: (position:number):number => {
                        if (!snapshot) snapshot = this.compiler.getScriptSnapshot(fileName);
                        if (!lineMap) lineMap = TypeScript.LineMap1.fromScriptSnapshot(snapshot);
                        return lineMap.getLineNumberFromPosition(position);
                    }
                }
            }

            return this.snapshots[fileName];
        }


        /**
         * Process the given state.
         *
         * @param state  The state that should be processed.
         */
        processState(state:DeclarationState) {
            this.dispatch('enterDeclaration', state);
            if (state.isDefaultPrevented)  return;

            this.ensureReflection(state);
            this.dispatch('process', state);
            if (state.isDefaultPrevented) return;

            state.declaration.getChildDecls().forEach((declaration) => {
                this.processState(state.createChildState(declaration));
            });

            this.dispatch('leaveDeclaration', state);
        }


        /**
         * Ensure that the given state holds a reflection.
         *
         * Reflections should always be created through this function as the dispatcher
         * will hold an array of created reflections for the final resolving phase.
         *
         * @param state  The state the reflection should be created for.
         * @return       TRUE if a new reflection has been created, FALSE if the
         *               state already holds a reflection.
         */
        ensureReflection(state:DeclarationState):boolean {
            if (state.reflection) {
                this.dispatch('mergeReflection', state);
                return false;
            }

            var parent        = <Models.DeclarationReflection>state.parentState.reflection;
            var reflection    = new Models.DeclarationReflection();
            reflection.name   = (state.flattenedName ? state.flattenedName + '.' : '') + state.getName();
            reflection.parent = parent;

            state.reflection = reflection;
            if (state.isSignature) {
                if (!parent.signatures) parent.signatures = [];
                parent.signatures.push(reflection);
            } else {
                parent.children.push(reflection);
            }

            this.project.reflections.push(reflection);
            if (!state.isInherited) {
                var declID = state.declaration.declID;
                this.idMap[declID] = reflection;
            }

            this.dispatch('createReflection', state);
            return true;
        }


        /**
         * Attach the given document to the project.
         *
         * This method is called by the compiler for each compiled document.
         *
         * @param document  The TypeScript document that should be processed by the dispatcher.
         */
        public attachDocument(document:TypeScript.Document) {
            var state = new DocumentState(this, document);
            this.dispatch('enterDocument', state);
            if (state.isDefaultPrevented) return;

            state.declaration.getChildDecls().forEach((declaration) => {
                this.processState(state.createChildState(declaration));
            });

            this.dispatch('leaveDocument', state);
        }


        public resolve() {
            this.dispatch('enterResolve');

            this.project.reflections.forEach((reflection) => {
                this.dispatch('resolveReflection', reflection);
            });

            this.dispatch('leaveResolve');
        }


        /**
         * Print debug information of the given declaration to the console.
         *
         * @param declaration  The declaration that should be printed.
         * @param indent  Used internally to indent child declarations.
         */
        static explainDeclaration(declaration:TypeScript.PullDecl, indent:string = '') {
            var flags = [];
            for (var flag in TypeScript.PullElementFlags) {
                if (!TypeScript.PullElementFlags.hasOwnProperty(flag)) continue;
                if (flag != +flag) continue;
                if (declaration.flags & flag) flags.push(TypeScript.PullElementFlags[flag]);
            }

            var str = indent + declaration.name;
            str += ' ' + TypeScript.PullElementKind[declaration.kind];
            str += ' (' + Dispatcher.flagsToString(declaration) + ')';
            console.log(str);

            indent += '  ';
            declaration.getChildDecls().forEach((decl) => {
                Dispatcher.explainDeclaration(decl, indent);
            })
        }


        /**
         * Return a string that explains the given flag bit mask.
         *
         * @param flags  A bit mask containing TypeScript.PullElementFlags bits.
         * @returns A string describing the given bit mask.
         */
        static flagsToString(flags:any):string {
            var items = [];
            for (var flag in TypeScript.PullElementFlags) {
                if (!TypeScript.PullElementFlags.hasOwnProperty(flag)) continue;
                if (flag != +flag) continue;
                if (flags & flag) items.push(TypeScript.PullElementFlags[flag]);
            }

            return items.join(', ');
        }
    }
}