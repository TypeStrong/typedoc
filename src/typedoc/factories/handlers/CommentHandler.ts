module TypeDoc.Factories
{
    export class CommentHandler
    {
        constructor(dispatcher:Dispatcher) {
            dispatcher.on('process', this.onProcess, this);
            dispatcher.on('resolveReflection', this.onResolveReflection, this);
        }


        private onProcess(state:DeclarationState) {
            var isInherit = false;
            if (state.isInherited) {
                isInherit = state.reflection.comment && state.reflection.comment.hasTag('inherit');
            }

            if (!state.reflection.comment || isInherit) {
                CommentHandler.applyComments(state);
            }
        }


        private onResolveReflection(reflection:Models.DeclarationReflection) {
            if (reflection.signatures) {
                CommentHandler.postProcessSignatures(reflection);
            }

            CommentHandler.removeCommentTags(reflection.comment, 'param');
            CommentHandler.removeCommentTags(reflection.comment, 'returns');
        }


        static postProcessSignatures(reflection:Models.DeclarationReflection) {
            if (reflection.comment && reflection.comment.hasTag('returns')) {
                reflection.comment.returns = reflection.comment.getTag('returns').text;
            }

            reflection.signatures.forEach((signature) => {
                if (reflection.comment) {
                    if (!signature.comment)
                        signature.comment = new Models.Comment();

                    if (!signature.comment.shortText)
                        signature.comment.shortText = reflection.comment.shortText;

                    if (!signature.comment.text)
                        signature.comment.text = reflection.comment.text;

                    if (signature.comment.hasTag('returns')) {
                        signature.comment.returns = signature.comment.getTag('returns').text;
                    } else {
                        signature.comment.returns = reflection.comment.returns;
                    }
                }

                signature.children.forEach((parameter) => {
                    var tag;
                    if (signature.comment)
                        tag = signature.comment.getTag('param', parameter.name);

                    if (reflection.comment && !tag)
                        tag = reflection.comment.getTag('param', parameter.name);

                    if (tag)
                        parameter.comment = new Models.Comment(tag.text);
                });
            });
        }


        static findComments(state:DeclarationState):string[] {
            var decl   = state.declaration;
            var ast    = decl.ast();
            var result = [];

            if (ast.kind() == TypeScript.SyntaxKind.VariableDeclarator) {
                var list = ast.parent;
                if (list.kind() != TypeScript.SyntaxKind.SeparatedList) {
                    return result;
                }

                var dispatcher = state.getDocumentState().dispatcher;
                var snapshot   = dispatcher.getSnapshot(ast.fileName());
                var astSource  = snapshot.getText(ast.start(), ast.end());
                var listSource = snapshot.getText(list.start(), list.end());
                if (astSource != listSource) {
                    return result;
                }

                ast = list.parent.parent;
            }

            var comments = ast.preComments();
            if (!comments || comments.length == 0) {
                return result;
            }

            comments.forEach((comment:TypeScript.Comment) => {
                if (!CommentHandler.isDocComment(comment)) return;
                result.push(comment.fullText());
            });

            return result;
        }


        static applyComments(state:DeclarationState) {
            CommentHandler.findComments(state).forEach((comment) => {
                state.reflection.comment = CommentHandler.parseDocComment(comment);
            });
        }


        static isDocComment(comment:TypeScript.Comment):boolean {
            if (comment.kind() === TypeScript.SyntaxKind.MultiLineCommentTrivia) {
                var fullText = comment.fullText();
                return fullText.charAt(2) === "*" && fullText.charAt(3) !== "/";
            }

            return false;
        }


        static removeCommentTags(comment:Models.Comment, tagName:string) {
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
            var lines = text.split(/\n/);
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


    Dispatcher.FACTORIES.push(CommentHandler);
}