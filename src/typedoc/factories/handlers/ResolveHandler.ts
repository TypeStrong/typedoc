module TypeDoc.Factories
{
    /**
     * A handler that allows a variable to be documented as being the type it is set to.
     *
     * Use the ``@resolve``  javadoc comment to trigger this handler. You can see an example
     * of this handler within the TypeDoc documentation. If you take a look at the [[Models.Kind]]
     * enumeration, it is documented as being a real enumeration, within the source code it is actually
     * just a reference to [[TypeScript.PullElementKind]].
     *
     * ```typescript
     * /**
     *  * @resolve
     *  * /
     * export var Kind = TypeScript.PullElementKind;
     * ```
     */
    export class ResolveHandler extends BaseHandler
    {
        /**
         * Create a new ResolveHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDeclaration(state:DeclarationState) {
            var isResolve = false;
            CommentHandler.findComments(state).forEach((comment) => {
                isResolve = isResolve || /\@resolve/.test(comment);
            });

            if (isResolve) {
                var symbol = state.declaration.getSymbol();
                if (!symbol) return;

                var declarations = symbol.type.getDeclarations();
                if (!declarations || declarations.length == 0) return;

                var declaration = state.declaration;
                state.declaration = declarations[0];

                this.dispatcher.ensureReflection(state);
                state.reflection.name = declaration.name;
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(ResolveHandler);
}