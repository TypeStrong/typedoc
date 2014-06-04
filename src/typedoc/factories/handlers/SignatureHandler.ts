module TypeDoc.Factories
{
    /**
     * A factory that creates signature reflections.
     */
    export class SignatureHandler
    {
        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 512);
            dispatcher.on('process', this.onProcess, this);
        }


        private onEnterDeclaration(state:DeclarationState) {
            // Ignore everything except parameters in functions
            if ((<DeclarationState>state.parentState).isSignature && !state.kindOf(Models.Kind.Parameter)) {
                state.preventDefault();
                return;
            }

            if (state.kindOf([Models.Kind.SomeFunction, Models.Kind.SomeSignature]) && !(state.isSignature)) {
                // Ignore inherited overwritten methods
                if (SignatureHandler.isMethodOverwrite(state)) {
                    var type = new Models.LateResolvingType(state.declaration);
                    state.reflection.overwrites = type;
                    state.reflection.signatures.forEach((signature) => signature.overwrites = type);
                    state.preventDefault();
                    return;
                }

                this.dispatcher.ensureReflection(state);
                state.reflection.kind = state.declaration.kind;

                var hasSignatures = (state.reflection.signatures && state.reflection.signatures.length > 0);
                var isAccessor = state.kindOf([Models.Kind.GetAccessor, Models.Kind.SetAccessor]);
                if (state.hasFlag(Models.Flags.Signature) || !hasSignatures || isAccessor) {
                    var signature = state.createSignatureState();
                    this.dispatcher.ensureReflection(signature);

                    signature.reflection.inheritedFrom = state.reflection.inheritedFrom;
                    signature.reflection.overwrites = state.reflection.overwrites;

                    this.dispatcher.processState(signature);
                }

                // Move to signature
                if (state.hasFlag(Models.Flags.Signature)) {
                    state.preventDefault();
                }
            }
        }


        private onProcess(state:DeclarationState) {
            if (!state.kindOf(Models.Kind.SomeFunction)) {
                return;
            }

            if (state.isSignature) {
                var symbol = state.declaration.getSignatureSymbol();
                if (symbol.returnType && symbol.returnType.name != 'void') {
                    state.reflection.type = createType(symbol.returnType);
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


        static isMethodOverwrite(state):boolean {
            if (!state.reflection) return false;
            if (!state.isInherited) return false;
            if (!(state.reflection.inheritedFrom instanceof Models.LateResolvingType)) return true;

            var type = <Models.LateResolvingType>state.reflection.inheritedFrom;
            return type.declaration.getParentDecl() != state.declaration.parentDecl;
        }
    }


    Dispatcher.FACTORIES.push(SignatureHandler);
}