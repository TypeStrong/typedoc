module TypeDoc.Factories
{
    /**
     * A handler that reflections for function types.
     */
    export class FunctionTypeHandler extends BaseHandler
    {
        /**
         * Create a new FunctionTypeHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_DECLARATION, this.onDeclaration, this, -256);
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            if (state.isSignature) {
                return;
            }

            var symbol = state.declaration.getSymbol();
            if (!symbol || !symbol.type) {
                return;
            }

            if (!(symbol.kind & TypeScript.PullElementKind.SomeFunction) &&
                symbol.type.kind == TypeScript.PullElementKind.FunctionType)
            {
                var declaration = symbol.type.getDeclarations()[0];
                var childState = state.createChildState(declaration);
                this.dispatcher.ensureReflection(childState);
                this.dispatcher.processState(childState.createSignatureState());

                state.reflection.type = TypeHandler.createNamedType('Function');
                childState.reflection.name = state.reflection.name + ' function signature';
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(FunctionTypeHandler);
}