module TypeDoc.Factories
{
    /**
     * A handler that creates signature reflections.
     */
    export class SignatureHandler extends BaseHandler
    {
        /**
         * The declaration kinds affected by this handler.
         */
        private affectedKinds:TypeScript.PullElementKind[] = [
            TypeScript.PullElementKind.SomeFunction,
            TypeScript.PullElementKind.SomeSignature,
            TypeScript.PullElementKind.FunctionType
        ];


        /**
         * Create a new SignatureHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 512);
            dispatcher.on(Dispatcher.EVENT_DECLARATION,       this.onDeclaration,      this);
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDeclaration(state:DeclarationState) {
            // Ignore everything except parameters in functions
            if ((<DeclarationState>state.parentState).isSignature && !state.kindOf(Models.Kind.Parameter)) {
                state.preventDefault();
                return;
            }

            if (state.kindOf(this.affectedKinds) && !(state.isSignature)) {
                // Ignore inherited overwritten methods
                if (SignatureHandler.isMethodOverwrite(state)) {
                    var type = new Models.LateResolvingType(state.declaration);
                    state.reflection.overwrites = type;
                    if (state.reflection.signatures) {
                        state.reflection.signatures.forEach((signature) => {
                            signature.overwrites = type;
                        });
                    }
                    state.preventDefault();
                } else {
                    this.dispatcher.ensureReflection(state);
                    state.reflection.kind = state.declaration.kind;
                    state.flattenedName   = null;
                    state.isFlattened     = false;

                    var hasSignatures = (state.reflection.signatures && state.reflection.signatures.length > 0);
                    var isAccessor = state.kindOf([Models.Kind.GetAccessor, Models.Kind.SetAccessor]);
                    if (state.hasFlag(Models.Flags.Signature) || !hasSignatures || isAccessor) {
                        var signature = state.createSignatureState();
                        this.dispatcher.ensureReflection(signature);

                        signature.reflection.inheritedFrom = state.reflection.inheritedFrom;
                        signature.reflection.overwrites = state.reflection.overwrites;
                        signature.reflection.isSignature = true;

                        this.dispatcher.processState(signature);
                    }

                    // Move to signature
                    if (state.hasFlag(Models.Flags.Signature)) {
                        state.preventDefault();
                    }
                }
            }
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            if (!state.kindOf(this.affectedKinds)) {
                return;
            }

            if (state.isSignature) {
                var symbol = state.declaration.getSignatureSymbol();
                if (symbol.returnType && symbol.returnType.name != 'void') {
                    state.reflection.type = TypeHandler.createType(symbol.returnType);
                } else {
                    state.reflection.type = null;
                }

                if (state.kindOf([Models.Kind.ConstructorMethod, Models.Kind.ConstructSignature])) {
                    state.reflection.kind = Models.Kind.ConstructSignature;
                } else if (state.kindOf([Models.Kind.GetAccessor, Models.Kind.SetAccessor])) {
                    state.reflection.kind = state.declaration.kind;
                } else {
                    state.reflection.kind = Models.Kind.CallSignature;
                }
            } else {
                // Move to siganture
                state.preventDefault();
            }
        }


        /**
         * Tests whether the given state describes a method overwrite.
         *
         * @param state  The state that should be tested.
         * @returns      TRUE when the state is a method overwrite, otherwise FALSE.
         */
        static isMethodOverwrite(state:DeclarationState):boolean {
            if (!state.reflection || !state.isInherited) return false;
            if (!(state.reflection.inheritedFrom instanceof Models.LateResolvingType)) return true;

            var type = <Models.LateResolvingType>state.reflection.inheritedFrom;
            return type.declaration.getParentDecl() != state.declaration.getParentDecl();
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(SignatureHandler);
}