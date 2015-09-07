module td.converter
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

            converter.on(Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this, 512);
        }


        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context:Context) {
            var project = context.project;
            var name;
            for (var key in project.reflections) {
                var reflection = project.reflections[key];
                if (!reflection.comment) {
                    findDeepComment(reflection);
                }
            }


            function push(parent:models.Reflection) {
                var part = parent.originalName;
                if (!part || part.substr(0, 2) == '__' || parent instanceof models.SignatureReflection) {
                    part = '';
                }

                if (part && part != '') {
                    name = (name == '' ? part : part + '.' + name);
                }
            }


            function findDeepComment(reflection:models.Reflection) {
                name = '';
                push(reflection);
                var target = reflection.parent;

                while (target && !(target instanceof models.ProjectReflection)) {
                    push(target);
                    if (target.comment) {
                        var tag;
                        if (reflection instanceof models.TypeParameterReflection) {
                            tag = target.comment.getTag('typeparam', reflection.name);
                            if (!tag) tag = target.comment.getTag('param', '<' + reflection.name + '>');
                        }

                        if (!tag) tag = target.comment.getTag('param', name);

                        if (tag) {
                            target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                            reflection.comment = new models.Comment('', tag.text);
                            break;
                        }
                    }

                    target = target.parent;
                }
            }
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('deepComment', DeepCommentPlugin);
}