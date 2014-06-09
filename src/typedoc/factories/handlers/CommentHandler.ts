module TypeDoc.Factories
{
    /**
     * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
     * the generated reflections.
     */
    export class CommentHandler extends BaseHandler
    {
        /**
         * Create a new CommentHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_DECLARATION, this.onProcess, this);
            dispatcher.on(Dispatcher.EVENT_RESOLVE, this.onResolveReflection, this);
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Invokes the comment parser.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onProcess(state:DeclarationState) {
            var isInherit = false;
            if (state.isInherited) {
                isInherit = state.reflection.comment && state.reflection.comment.hasTag('inherit');
            }

            if (!state.reflection.comment || isInherit) {
                CommentHandler.findComments(state).forEach((comment) => {
                    state.reflection.comment = CommentHandler.parseDocComment(comment);
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
         * @param res
         */
        private onResolveReflection(res:ResolveReflectionEvent) {
            var reflection = res.reflection;
            if (reflection.signatures) {
                var comment = reflection.comment;
                if (comment && comment.hasTag('returns')) {
                    comment.returns = comment.getTag('returns').text;
                    CommentHandler.removeTags(comment, 'returns');
                }

                reflection.signatures.forEach((signature) => {
                    var childComment = signature.comment;
                    if (childComment && childComment.hasTag('returns')) {
                        childComment.returns = childComment.getTag('returns').text;
                        CommentHandler.removeTags(childComment, 'returns');
                    }

                    if (comment) {
                        if (!childComment) {
                            childComment = signature.comment = new Models.Comment();
                        }

                        childComment.shortText = childComment.shortText || comment.shortText;
                        childComment.text      = childComment.text      || comment.text;
                        childComment.returns   = childComment.returns   || comment.returns;
                    }

                    signature.children.forEach((parameter) => {
                        var tag;
                        if (childComment)    tag = childComment.getTag('param', parameter.name);
                        if (comment && !tag) tag = comment.getTag('param', parameter.name);
                        if (tag) {
                            parameter.comment = new Models.Comment(tag.text);
                        }
                    });

                    CommentHandler.removeTags(childComment, 'param');
                });

                CommentHandler.removeTags(comment, 'param');
            }
        }


        /**
         * Test whether the given TypeScript comment instance is a doc comment.
         *
         * @param comment  The TypeScript comment that should be tested.
         * @returns True when the comment is a doc comment, otherwise false.
         */
        static isDocComment(comment:TypeScript.Comment):boolean {
            if (comment.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia) {
                var fullText = comment.fullText();
                return fullText.charAt(2) === "*" && fullText.charAt(3) !== "/";
            }

            return false;
        }


        /**
         * Remove all tags with the given name from the given comment instance.
         *
         * @param comment  The comment that should be modified.
         * @param tagName  The name of the that that should be removed.
         */
        static removeTags(comment:Models.Comment, tagName:string) {
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
         * Find all doc comments associated with the declaration of the given state
         * and return their plain text.
         *
         * Variable declarations need a special treatment, their comments are stored with the
         * surrounding VariableStatement ast element. Their ast hierarchy looks like this:
         * > VariableStatement &#8594; VariableDeclaration &#8594; SeparatedList &#8594; VariableDeclarator
         *
         * This reflect the possibility of JavaScript to define multiple variables with a single ```var```
         * statement. We therefore have to check whether the VariableStatement contains only one variable
         * and then can assign the comment of the VariableStatement to the VariableDeclarator declaration.
         *
         * @param state  The state containing the declaration whose comments should be extracted.
         * @returns A list of all doc comments associated with the state.
         */
        static findComments(state:DeclarationState):string[] {
            var decl = state.declaration;
            var ast  = decl.ast();

            if (ast.kind() == TypeScript.SyntaxKind.VariableDeclarator) {
                var list = ast.parent;
                if (list.kind() != TypeScript.SyntaxKind.SeparatedList) {
                    return [];
                }

                var snapshot   = state.getSnapshot(ast.fileName());
                var astSource  = snapshot.getText(ast.start(), ast.end());
                var listSource = snapshot.getText(list.start(), list.end());
                if (astSource != listSource) {
                    return [];
                }

                ast = list.parent.parent;
            }

            var comments = ast.preComments();
            if (!comments || comments.length == 0) {
                return [];
            }

            var result = [];
            comments.forEach((comment:TypeScript.Comment) => {
                if (!CommentHandler.isDocComment(comment)) return;
                result.push(comment.fullText());
            });

            return result;
        }


        /**
         * Parse the given doc comment string.
         *
         * @param text     The doc comment string that should be parsed.
         * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
         * @returns        A populated [[Models.Comment]] instance.
         */
        static parseDocComment(text:string, comment:Models.Comment = new Models.Comment()):Models.Comment {
            function consumeTypeData(line:string):string {
                line = line.replace(/^\{[^\}]*\}/, '');
                line = line.replace(/^\[[^\]]*\]/, '');
                return line.trim();
            }

            text = text.replace(/^\s*\/\*+/, '');
            text = text.replace(/\*+\/\s*$/, '');

            var currentTag:Models.CommentTag;
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

                    currentTag = new Models.CommentTag(tagName, paramName, line);
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
    Dispatcher.HANDLERS.push(CommentHandler);
}