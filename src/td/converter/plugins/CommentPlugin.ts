module td
{
    /**
     * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
     * the generated reflections.
     */
    export class CommentPlugin implements IPluginInterface
    {
        /**
         * The converter this plugin is attached to.
         */
        private converter:Converter;


        /**
         * Create a new CommentPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            this.converter = converter;
            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
            converter.on(Converter.EVENT_CREATE_SIGNATURE,   this.onDeclaration, this);
            converter.on(Converter.EVENT_RESOLVE,            this.onResolve,     this);
        }


        /**
         * Removes this plugin.
         */
        remove() {
            this.converter.off(null, null, this);
            this.converter = null;
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Invokes the comment parser.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(reflection:ICommentContainer, node:ts.Node) {
            var sourceFile = ts.getSourceFileOfNode(node);
            var comments = ts.getJsDocComments(node, sourceFile);
            if (comments) {
                comments.forEach((comment) => {
                    reflection.comment = CommentPlugin.parseComment(sourceFile.text.substring(comment.pos, comment.end), reflection.comment);
                });
            }
        }


        /**
         * Triggered when the dispatcher resolves a reflection.
         *
         * Cleans up comment tags related to signatures like @param or @return
         * and moves their data to the corresponding parameter reflections.
         *
         * This hook also copies over the comment of function implementations to their
         * signatures.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(reflection:DeclarationReflection) {
            if (!(reflection instanceof DeclarationReflection)) return;
            var signatures = reflection.getAllSignatures();
            if (signatures.length) {
                var comment = reflection.comment;
                if (comment && comment.hasTag('returns')) {
                    comment.returns = comment.getTag('returns').text;
                    CommentPlugin.removeTags(comment, 'returns');
                }

                signatures.forEach((signature) => {
                    var childComment = signature.comment;
                    if (childComment && childComment.hasTag('returns')) {
                        childComment.returns = childComment.getTag('returns').text;
                        CommentPlugin.removeTags(childComment, 'returns');
                    }

                    if (comment) {
                        if (!childComment) {
                            childComment = signature.comment = new Comment();
                        }

                        childComment.shortText = childComment.shortText || comment.shortText;
                        childComment.text      = childComment.text      || comment.text;
                        childComment.returns   = childComment.returns   || comment.returns;
                    }

                    if (signature.parameters) {
                        signature.parameters.forEach((parameter) => {
                            var tag;
                            if (childComment)    tag = childComment.getTag('param', parameter.name);
                            if (comment && !tag) tag = comment.getTag('param', parameter.name);
                            if (tag) {
                                parameter.comment = new Comment(tag.text);
                            }
                        });
                    }

                    CommentPlugin.removeTags(childComment, 'param');
                });

                CommentPlugin.removeTags(comment, 'param');
            }
        }


        /**
         * Remove all tags with the given name from the given comment instance.
         *
         * @param comment  The comment that should be modified.
         * @param tagName  The name of the that that should be removed.
         */
        static removeTags(comment:Comment, tagName:string) {
            if (!comment || !comment.tags) return;

            var i = 0, c = comment.tags.length;
            while (i < c) {
                if (comment.tags[i].tagName == tagName) {
                    comment.tags.splice(i, 1);
                    c--;
                } else {
                    i++;
                }
            }
        }


        /**
         * Parse the given doc comment string.
         *
         * @param text     The doc comment string that should be parsed.
         * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
         * @returns        A populated [[Models.Comment]] instance.
         */
        static parseComment(text:string, comment:Comment = new Comment()):Comment {
            function consumeTypeData(line:string):string {
                line = line.replace(/^\{[^\}]*\}/, '');
                line = line.replace(/^\[[^\]]*\]/, '');
                return line.trim();
            }

            text = text.replace(/^\s*\/\*+/, '');
            text = text.replace(/\*+\/\s*$/, '');

            var currentTag:CommentTag;
            var shortText:number = 0;
            var lines = text.split(/\r\n?|\n/);
            lines.forEach((line) => {
                line = line.replace(/^\s*\*? ?/, '');
                line = line.replace(/\s*$/, '');

                var tag = /^@(\w+)/.exec(line);
                if (tag) {
                    var tagName = tag[1].toLowerCase();
                    line = line.substr(tagName.length + 1).trim();

                    if (tagName == 'return') tagName = 'returns';
                    if (tagName == 'param') {
                        line = consumeTypeData(line);
                        var param = /[^\s]+/.exec(line);
                        if (param) {
                            var paramName = param[0];
                            line = line.substr(paramName.length + 1).trim();
                        }
                        line = consumeTypeData(line);
                    } else if (tagName == 'returns') {
                        line = consumeTypeData(line);
                    }

                    currentTag = new CommentTag(tagName, paramName, line);
                    if (!comment.tags) comment.tags = [];
                    comment.tags.push(currentTag);
                } else {
                    if (currentTag) {
                        currentTag.text += '\n' + line;
                    } else if (line == '' && shortText == 0) {
                        // Ignore
                    } else if (line == '' && shortText == 1) {
                        shortText = 2;
                    } else {
                        if (shortText == 2) {
                            comment.text += (comment.text == '' ? '' : '\n') + line;
                        } else {
                            comment.shortText += (comment.shortText == '' ? '' : '\n') + line;
                            shortText = 1;
                        }
                    }
                }
            });

            return comment;
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('CommentPlugin', CommentPlugin);
}