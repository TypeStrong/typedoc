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

            dispatcher.on(Dispatcher.EVENT_END_DECLARATION, this.onEndDeclaration, this);
        }


        /**
         * Triggered when the dispatcher has finished processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onEndDeclaration(state:DeclarationState) {
            var literal = ObjectLiteralHandler.getLiteralDeclaration(state.declaration);
            if (literal && literal.getChildDecls().length > 0) {
                if (state.kindOf(TypeScript.PullElementKind.Variable)) {
                    state.reflection.kind = ReflectionHandler.mergeKinds(state.reflection.kind, TypeScript.PullElementKind.ObjectLiteral);
                    literal.getChildDecls().forEach((declaration) => {
                        var childState = state.createChildState(declaration);
                        this.dispatcher.processState(childState);
                    });
                } else {
                    literal.getChildDecls().forEach((declaration) => {
                        var childState = state.createChildState(declaration);
                        childState.isFlattened   = true;
                        childState.flattenedName = state.flattenedName ? state.flattenedName + '.' + state.declaration.name : state.getName();
                        this.dispatcher.processState(childState);
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

            if (symbol.type && (symbol.type.kind & TypeScript.PullElementKind.ObjectLiteral ||
                symbol.type.kind & TypeScript.PullElementKind.ObjectType))
            {
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