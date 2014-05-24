module TypeDoc.Factories
{
    export class InheritanceHandler
    {
        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('mergeReflection',  this.onMergeReflection,  this);
            dispatcher.on('createReflection', this.onCreateReflection, this);
            dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 1024);
            dispatcher.on('leaveDeclaration', this.onLeaveDeclaration, this);
        }


        onMergeReflection(state:DeclarationState) {
            if (state.isInherited && state.reflection && !state.reflection.inheritedFrom && !state.kindOf([Models.Kind.Class, Models.Kind.Interface])) {
                state.reflection.overwrites = new Models.LateResolvingType(state.declaration);
                state.preventDefault();
            }
        }


        onCreateReflection(state:DeclarationState) {
            if (!state.isInherited) return;
            state.reflection.inheritedFrom = new Models.LateResolvingType(state.declaration);
        }


        onEnterDeclaration(state:DeclarationState) {
            if (state.isInherited && (state.hasFlag(TypeScript.PullElementFlags.Private) || state.hasFlag(TypeScript.PullElementFlags.Static))) {
                state.preventDefault();
                state.stopPropagation();
            }
        }


        onLeaveDeclaration(state:DeclarationState) {
            var symbol = <TypeScript.PullTypeSymbol>state.declaration.getSymbol();
            if (!(symbol instanceof TypeScript.PullTypeSymbol)) {
                return;
            }

            if (!state.isInherited) {
                var extendedBy = symbol.getTypesThatExtendThisType();
                if (extendedBy.length > 0) {
                    if (!state.reflection.extendedBy) state.reflection.extendedBy = [];
                    extendedBy.forEach((symbol) => {
                        state.reflection.extendedBy.push(new Models.LateResolvingType(symbol));
                    });
                }

                var extendedTypes = symbol.getExtendedTypes();
                if (extendedTypes.length > 0) {
                    if (!state.reflection.extendedTypes) state.reflection.extendedTypes = [];
                    extendedTypes.forEach((symbol) => {
                        state.reflection.extendedTypes.push(new Models.LateResolvingType(symbol));
                    });
                }
            }

            symbol.getExtendedTypes().forEach((symbol) => {
                symbol.getDeclarations().forEach((declaration) => {
                    this.dispatcher.processState(state.createInheritanceState(declaration));
                });
            });
        }
    }


    Dispatcher.FACTORIES.push(InheritanceHandler);
}