module TypeDoc.Factories
{
    /**
     * A factory that copies basic values from declarations to reflections.
     *
     * This factory sets the following values on reflection models:
     *  - flags
     *  - kind
     *  - type
     *  - definition
     *  - isOptional
     *  - defaultValue
     */
    export class ReflectionHandler
    {
        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('createReflection', this.onCreateReflection, this);
            dispatcher.on('mergeReflection', this.onMergeReflection, this);
        }


        private onCreateReflection(state:DeclarationState) {
            state.reflection.flags = state.declaration.flags;
            state.reflection.kind  = state.declaration.kind;

            var symbol = state.declaration.getSymbol();
            if (symbol) {
                state.reflection.type = createType(symbol.type);
                state.reflection.definition = symbol.toString();
                state.reflection.isOptional = symbol.isOptional;

                if (symbol.type.kind == Models.Kind.ObjectType || symbol.type.kind == Models.Kind.ObjectLiteral) {
                    var typeDeclaration = symbol.type.getDeclarations()[0];
                    typeDeclaration.getChildDecls().forEach((declaration) => {
                        var typeState = state.createChildState(declaration);
                        typeState.isFlattened   = true;
                        typeState.flattenedName = state.getName();
                        // typeState.parentState   = state.parentState;
                        this.dispatcher.processState(typeState);
                    });
                }

                if (state.declaration.kind == Models.Kind.Parameter) {
                    var ast = (<TypeScript.Parameter>state.declaration.ast()).equalsValueClause;
                    if (ast) {
                        var snapshot = state.getSnapshot(ast.fileName());
                        var source = snapshot.getText(ast.start(), ast.end());
                        source = source.replace(/^[\s=]+|\s+$/g, '');
                        state.reflection.defaultValue = source;
                    }
                }
            } else {
                state.reflection.definition = state.reflection.name;
            }
        }


        private onMergeReflection(state:DeclarationState) {
            if (state.declaration.kind != Models.Kind.Container) {
                state.reflection.kind = state.declaration.kind;
            }
        }
    }


    Dispatcher.FACTORIES.push(ReflectionHandler);
}