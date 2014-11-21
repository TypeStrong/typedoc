module td
{
    /**
     * A handler that moves comments with dot syntax to their target.
     */
    export class DeepCommentPlugin extends ConverterPlugin
    {
        /**
         * Create a new CommentHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);

            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this, -512);
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event:CompilerEvent) {
            var reflection = <DeclarationReflection>event.reflection;
            if (reflection.comment) {
                return;
            }

            function push(reflection:DeclarationReflection) {
                var part = reflection.originalName;
                if (reflection instanceof SignatureReflection) {
                    part = '';
                }

                if (part && part != '') {
                    name = (name == '' ? part : part + '.' + name);
                }
            }

            var name   = '';
            var target = <DeclarationReflection>reflection.parent;
            push(reflection);
            if (name == '') {
                return;
            }

            while (target instanceof DeclarationReflection) {
                if (target.comment) {
                    var tag = target.comment.getTag('param', name);
                    if (tag) {
                        target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                        reflection.comment = new Comment('', tag.text);
                        break;
                    }
                }

                target = <DeclarationReflection>target.parent;
            }
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('DeepCommentPlugin', DeepCommentPlugin);
}