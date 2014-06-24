module TypeDoc.Factories
{
    /**
     * A handler that reflects object literals defined as variables.
     */
    export class ObjectLiteralHandler extends BaseHandler
    {
        /**
         * Create a new ObjectLiteralHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_DECLARATION, this.onDeclaration, this, 1024);
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            var literal = ObjectLiteralHandler.getLiteralDeclaration(state.declaration);
            if (literal && literal.getChildDecls().length > 0) {
                if (state.kindOf(TypeScript.PullElementKind.Variable)) {
                    state.reflection.kind = ReflectionHandler.mergeKinds(state.reflection.kind, TypeScript.PullElementKind.ObjectLiteral);
                    literal.getChildDecls().forEach((declaration) => {
                        this.dispatcher.processState(state.createChildState(declaration));
                    });
                } else {
                    literal.getChildDecls().forEach((declaration) => {
                        var typeState = state.createChildState(declaration);
                        typeState.isFlattened   = true;
                        typeState.flattenedName = state.flattenedName ? state.flattenedName + '.' + state.declaration.name : state.getName();
                        this.dispatcher.processState(typeState);
                    });
                }

                state.reflection.type = TypeHandler.createNamedType('Object');
            }
        }


        static getLiteralDeclaration(declaration:TypeScript.PullDecl):TypeScript.PullDecl {
            var symbol = declaration.getSymbol();
            if (!symbol) {
                return null;
            }

            if (symbol.type && (symbol.type.kind & TypeScript.PullElementKind.ObjectLiteral || symbol.type.kind & TypeScript.PullElementKind.ObjectType)) {
                return symbol.type.getDeclarations()[0];
            } else {
                return null;
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(ObjectLiteralHandler);
}