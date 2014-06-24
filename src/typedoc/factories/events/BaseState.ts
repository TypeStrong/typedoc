module TypeDoc.Factories
{
    /**
     * Base class of all state events.
     *
     * States store the current declaration and its matching reflection while
     * being processed by the [[Dispatcher]]. [[BaseHandler]] instances can alter the state and
     * stop it from being further processed.
     *
     * For each child declaration the dispatcher will create a child [[DeclarationState]]
     * state. The root state is always an instance of [[DocumentState]].
     */
    export class BaseState extends DispatcherEvent
    {
        /**
         * The parent state of this state.
         */
        parentState:BaseState;

        /**
         * The TypeScript declaration that should be reflected by this state.
         */
        declaration:TypeScript.PullDecl;

        /**
         * The TypeScript declaration that should be reflected by this state.
         */
        originalDeclaration:TypeScript.PullDecl;

        /**
         * The reflection created for the declaration of this state.
         */
        reflection:Models.BaseReflection;

        /**
         * Is this a declaration from an external document?
         */
        isExternal:boolean;



        /**
         * Create a new BaseState instance.
         */
        constructor(parent:DispatcherEvent, declaration:TypeScript.PullDecl, reflection?:Models.BaseReflection) {
            super(parent.dispatcher, parent.compiler, parent.project);

            if (parent instanceof BaseState) {
                this.parentState = <BaseState>parent;
                this.isExternal  = this.parentState.isExternal;
            }

            this.reflection          = reflection;
            this.declaration         = declaration;
            this.originalDeclaration = declaration;
        }


        /**
         * Check whether the given flag is set on the declaration of this state.
         *
         * @param flag   The flag that should be looked for.
         */
        hasFlag(flag:number):boolean {
            return (this.declaration.flags & flag) !== 0;
        }


        /**
         * @param kind  The kind to test for.
         * @param useOriginalDeclaration  Should the kind of the original declaration be checked?
         */
        kindOf(kind:TypeScript.PullElementKind, useOriginalDeclaration?:boolean):boolean;

        /**
         * @param kind  An array of kinds to test for.
         * @param useOriginalDeclaration  Should the kind of the original declaration be checked?
         */
        kindOf(kind:TypeScript.PullElementKind[], useOriginalDeclaration?:boolean):boolean;

        /**
         * Test whether the declaration of this state is of the given kind.
         */
        kindOf(kind:any, useOriginalDeclaration?:boolean):boolean {
            var test = useOriginalDeclaration ? this.originalDeclaration.kind : this.declaration.kind;
            if (Array.isArray(kind)) {
                for (var i = 0, c = kind.length; i < c; i++) {
                    if ((test & kind[i]) !== 0) {
                        return true;
                    }
                }
                return false;
            } else {
                return (test & kind) !== 0;
            }
        }


        getName():string {
            return BaseState.getName(this.declaration);
        }


        /**
         * Return the root state of this state.
         *
         * The root state is always an instance of {DocumentState}.
         */
        getDocumentState():DocumentState {
            var state = this;
            while (state) {
                if (state instanceof DocumentState) return <DocumentState>state;
                state = state.parentState;
            }
            return null;
        }


        /**
         * Return the snapshot of the given filename.
         *
         * @param fileName  The filename of the snapshot.
         */
        getSnapshot(fileName:string):IScriptSnapshot {
            return this.getDocumentState().compiler.getSnapshot(fileName);
        }


        /**
         * Create a child state of this state with the given declaration.
         *
         * This state must hold an reflection when creating a child state, an error will
         * be thrown otherwise. If the reflection of this state contains a child with
         * the name of the given declaration, the reflection of the child state will be
         * populated with it.
         *
         * @param declaration  The declaration that is encapsulated by the child state.
         */
        createChildState(declaration:TypeScript.PullDecl):DeclarationState {
            if (!this.reflection) {
                throw new Error('Cannot create a child state of state without a reflection.');
            }

            var reflection:Models.DeclarationReflection = null;
            var name = BaseState.getName(declaration);
            this.reflection.children.some((child) => {
                if (child.name != name) return false;
                if ((child.flags & TypeScript.PullElementFlags.Static) !=
                    (declaration.flags & TypeScript.PullElementFlags.Static)) return false;

                reflection = child;
                return true;
            });

            return new DeclarationState(this, declaration, reflection);
        }


        static getName(declaration:TypeScript.PullDecl):string {
            if (declaration.kind == Models.Kind.ConstructorMethod || declaration.kind == Models.Kind.ConstructSignature) {
                return 'constructor';
            } else {
                return declaration.name;
            }
        }
    }
}