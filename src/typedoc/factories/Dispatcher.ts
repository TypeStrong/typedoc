module TypeDoc.Factories
{
    /**
     * The dispatcher receives documents from the compiler and emits
     * events for all discovered declarations.
     *
     * [[BaseHandler]] instances are the actual workhorses behind the dispatcher. They listen
     * to the events emitted by the dispatcher and populate the generated [[BaseReflection]]
     * instances. Each event contains a [[BaseState]] instance describing the current state the
     * dispatcher is in. Handlers can alter the state or stop it from being further processed.
     *
     * For each document (a single *.ts file) the dispatcher will generate the following event flow.
     * Declarations are processed according to their hierarchy.
     *
     *  * [[Dispatcher.EVENT_BEGIN]]<br>
     *    Triggered when the dispatcher starts processing a project. The listener receives
     *    an instance of [[DispatcherEvent]]. By calling [[DispatcherEvent.preventDefault]] the
     *    project file will not be processed.
     *
     *  * [[Dispatcher.EVENT_BEGIN_DOCUMENT]]<br>
     *    Triggered when the dispatcher starts processing a TypeScript document. The listener receives
     *    an instance of [[DocumentState]]. By calling [[DocumentState.preventDefault]] the entire
     *    TypeScript file will be ignored.
     *
     *    * [[Dispatcher.EVENT_BEGIN_DECLARATION]]<br>
     *      Triggered when the dispatcher starts processing a declaration. The listener receives
     *      an instance of [[DeclarationState]]. The [[DeclarationState.reflection]] property of
     *      the state is undefined at this moment. By calling [[DeclarationState.preventDefault]]
     *      the declaration will be skipped.
     *
     *      * [[Dispatcher.EVENT_CREATE_REFLECTION]]<br>
     *        Triggered when the dispatcher creates a new reflection instance. The listener receives
     *        an instance of [[DeclarationState]]. The [[DeclarationState.reflection]] property of
     *        the state contains a newly created [[DeclarationReflection]] instance.
     *
     *      * [[Dispatcher.EVENT_MERGE_REFLECTION]]<br>
     *        Triggered when the dispatcher merges an existing reflection with a new declaration.
     *        The listener receives an instance of [[DeclarationState]]. The
     *        [[DeclarationState.reflection]] property of the state contains the persistent
     *        [[DeclarationReflection]] instance.
     *
     *    * [[Dispatcher.EVENT_DECLARATION]]<br>
     *      Triggered when the dispatcher processes a declaration. The listener receives an instance
     *      of [[DeclarationState]].
     *
     *    * [[Dispatcher.EVENT_END_DECLARATION]]<br>
     *      Triggered when the dispatcher has finished processing a declaration. The listener receives
     *      an instance of [[DeclarationState]].
     *
     *  * [[Dispatcher.EVENT_END_DOCUMENT]]<br>
     *    Triggered when the dispatcher has finished processing a TypeScript document. The listener
     *    receives an instance of [[DocumentState]].
     *
     *
     *  After the dispatcher has processed all documents, it will enter the resolving phase and
     *  trigger the following event flow.
     *
     *  * [[Dispatcher.EVENT_BEGIN_RESOLVE]]<br>
     *    Triggered when the dispatcher enters the resolving phase. The listener receives an instance
     *    of [[DispatcherEvent]].
     *
     *    * [[Dispatcher.EVENT_RESOLVE]]<br>
     *      Triggered when the dispatcher resolves a reflection. The listener receives an instance
     *      of [[ReflectionEvent]].
     *
     *  * [[Dispatcher.EVENT_END_RESOLVE]]<br>
     *    Triggered when the dispatcher leaves the resolving phase. The listener receives an instance
     *    of [[DispatcherEvent]].
     */
    export class Dispatcher extends EventDispatcher
    {
        /**
         * The application this dispatcher is attached to.
         */
        application:IApplication;

        /**
         * List of all handlers that are attached to the renderer.
         */
        handlers:any[];

        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         * @event
         */
        static EVENT_BEGIN:string = 'begin';

        /**
         * Triggered when the dispatcher starts processing a TypeScript document.
         * @event
         */
        static EVENT_BEGIN_DOCUMENT:string = 'beginDocument';

        /**
         * Triggered when the dispatcher has finished processing a TypeScript document.
         * @event
         */
        static EVENT_END_DOCUMENT:string = 'endDocument';

        /**
         * Triggered when the dispatcher creates a new reflection instance.
         * @event
         */
        static EVENT_CREATE_REFLECTION:string = 'createReflection';

        /**
         * Triggered when the dispatcher merges an existing reflection with a new declaration.
         * @event
         */
        static EVENT_MERGE_REFLECTION:string = Dispatcher.EVENT_MERGE_REFLECTION;

        /**
         * Triggered when the dispatcher starts processing a declaration.
         * @event
         */
        static EVENT_BEGIN_DECLARATION:string = 'beginDeclaration';

        /**
         * Triggered when the dispatcher processes a declaration.
         * @event
         */
        static EVENT_DECLARATION:string = 'declaration';

        /**
         * Triggered when the dispatcher has finished processing a declaration.
         * @event
         */
        static EVENT_END_DECLARATION:string = 'endDeclaration';

        /**
         * Triggered when the dispatcher enters the resolving phase.
         * @event
         */
        static EVENT_BEGIN_RESOLVE:string = 'beginResolve';

        /**
         * Triggered when the dispatcher resolves a reflection.
         * @event
         */
        static EVENT_RESOLVE:string = 'resolve';

        /**
         * Triggered when the dispatcher leaves the resolving phase.
         * @event
         */
        static EVENT_END_RESOLVE:string = 'endResolve';


        /**
         * Registry containing the handlers, that should be created by default.
         */
        static HANDLERS:any[] = [];



        /**
         * Create a new Dispatcher instance.
         *
         * @param application  The application this dispatcher is attached to.
         */
        constructor(application:IApplication) {
            super();
            this.application = application;

            this.handlers = [];
            Dispatcher.HANDLERS.forEach((factory) => {
                this.handlers.push(new factory(this));
            });
        }


        /**
         * Compile the given list of source files and generate a reflection for them.
         *
         * @param inputFiles  A list of source files.
         * @returns The generated root reflection.
         */
        createProject(inputFiles:string[]):Models.ProjectReflection {
            var settings = this.application.settings.compiler;
            var compiler = new Compiler(settings, inputFiles);
            var project  = new Models.ProjectReflection(this.application.settings.name);
            var event    = new DispatcherEvent(this, compiler, project);

            this.compile(event);
            this.resolve(event);

            return project;
        }


        /**
         * Run the compiler.
         *
         * @param event  The event containing the project and compiler.
         */
        private compile(event:DispatcherEvent) {
            this.application.log('Running TypeScript compiler', LogLevel.Verbose);

            this.dispatch(Dispatcher.EVENT_BEGIN, event);
            if (event.isDefaultPrevented) {
                return;
            }

            event.compiler.run().forEach((document) => {
                this.application.log(Util.format('Processing %s', document.fileName), LogLevel.Verbose);

                var state = event.createDocumentState(document);
                this.dispatch(Dispatcher.EVENT_BEGIN_DOCUMENT, state);
                if (state.isDefaultPrevented) {
                    return;
                }

                state.declaration.getChildDecls().forEach((declaration) => {
                    this.processState(state.createChildState(declaration));
                });

                this.dispatch(Dispatcher.EVENT_END_DOCUMENT, state);
            });
        }


        /**
         * Resolve all created reflections.
         *
         * @param event  The event containing the project and compiler.
         */
        private resolve(event:DispatcherEvent) {
            this.application.log('Resolving project', LogLevel.Verbose);

            this.dispatch(Dispatcher.EVENT_BEGIN_RESOLVE, event);

            event.project.reflections.forEach((reflection) => {
                this.dispatch(Dispatcher.EVENT_RESOLVE, event.createReflectionEvent(reflection));
            });

            this.dispatch(Dispatcher.EVENT_END_RESOLVE, event);
        }


        /**
         * Process the given state.
         *
         * @param state  The state that should be processed.
         */
        processState(state:DeclarationState) {
            this.dispatch(Dispatcher.EVENT_BEGIN_DECLARATION, state);
            if (state.isDefaultPrevented)  return;

            this.ensureReflection(state);
            this.dispatch(Dispatcher.EVENT_DECLARATION, state);
            if (state.isDefaultPrevented) return;

            state.declaration.getChildDecls().forEach((declaration) => {
                this.processState(state.createChildState(declaration));
            });

            this.dispatch(Dispatcher.EVENT_END_DECLARATION, state);
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
                this.dispatch(Dispatcher.EVENT_MERGE_REFLECTION, state);
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

            state.project.reflections.push(reflection);

            if (!state.isInherited) {
                var declID = state.declaration.declID;
                state.compiler.idMap[declID] = reflection;
            }

            this.dispatch(Dispatcher.EVENT_CREATE_REFLECTION, state);
            return true;
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