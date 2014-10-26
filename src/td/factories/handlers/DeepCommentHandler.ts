module TypeDoc.Factories
{
    /**
     * A handler that moves comments with dot syntax to their target.
     */
    export class DeepCommentHandler extends BaseHandler
    {
        /**
         * Create a new CommentHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_DECLARATION, this.onDeclaration, this, -512);
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            var reflection = state.reflection;
            if (reflection.comment) {
                return;
            }

            function push(reflection:Models.DeclarationReflection) {
                var part = reflection.originalName;
                if (reflection.isSignature) {
                    part = '';
                }

                if (part && part != '') {
                    name = (name == '' ? part : part + '.' + name);
                }
            }

            var name   = '';
            var target = <Models.DeclarationReflection>reflection.parent;
            push(reflection);
            if (name == '') {
                return;
            }

            while (target instanceof Models.DeclarationReflection) {
                if (target.comment) {
                    var tag = target.comment.getTag('param', name);
                    if (tag) {
                        target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                        reflection.comment = new Models.Comment('', tag.text);
                        break;
                    }
                }

                target = <Models.DeclarationReflection>target.parent;
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(DeepCommentHandler);
}