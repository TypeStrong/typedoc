module TypeDoc.Factories
{
    /**
     * Structure used by [[ContainerCommentHandler]] to store discovered module comments.
     */
    interface IModuleComment
    {
        /**
         * The module reflection this comment is targeting.
         */
        reflection:Models.DeclarationReflection;

        /**
         * The full text of the best matched comment.
         */
        fullText:string;

        /**
         * Has the full text been marked as being preferred?
         */
        isPreferred:boolean;
    }


    /**
     * A handler that extracts comments of containers like modules.
     *
     * The [[CommentHandler]] only extracts comments directly attached to the current
     * declaration, while this handler looks up the comments of the parent ast of the given
     * declaration if it is some container. As modules might be defined multiple times,
     * this handler stores the found comments and applies them in the resolving phase.
     *
     * If multiple comments for the same module are found, the longest comment will be preferred.
     * One may explicitly set the preferred module comment by appending the tag `@preferred`.
     */
    export class ModuleCommentHandler extends BaseHandler
    {
        /**
         * The ast walker factory.
         */
        private factory:TypeScript.AstWalkerFactory;

        /**
         * List of discovered module comments.
         */
        private comments:{[id:number]:IModuleComment};


        /**
         * Create a new ModuleCommentHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            this.factory = TypeScript.getAstWalkerFactory();

            dispatcher.on(Dispatcher.EVENT_BEGIN,         this.onBegin,        this);
            dispatcher.on(Dispatcher.EVENT_DECLARATION,   this.onDeclaration,  this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_RESOLVE, this.onBeginResolve, this);
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event:DispatcherEvent) {
            this.comments = {};
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            if (!state.kindOf(TypeScript.PullElementKind.Container)) {
                return;
            }

            var ast = state.declaration.ast();
            ast = ast.parent;
            if (ast && ast.kind() == TypeScript.SyntaxKind.QualifiedName) {
                var identifiers = [];
                this.factory.simpleWalk(ast, (ast:TypeScript.AST, astState:any) => {
                    if (ast.kind() == TypeScript.SyntaxKind.IdentifierName) {
                        identifiers.push(ast);
                    }
                });

                if (identifiers.indexOf(state.declaration.ast()) < identifiers.length - 1) {
                    return;
                }

                while (ast && ast.kind() == TypeScript.SyntaxKind.QualifiedName) {
                    ast = ast.parent;
                }
            }

            if (!ast || ast.kind() != TypeScript.SyntaxKind.ModuleDeclaration) {
                return;
            }

            var comments = ast.preComments();
            if (!comments || comments.length == 0) {
                return;
            }

            var comment = comments[comments.length -1];
            if (!CommentHandler.isDocComment(comment)) {
                return;
            }

            var fullText    = comment.fullText();
            var isPreferred = (fullText.toLowerCase().indexOf('@preferred') != -1);

            if (this.comments[state.reflection.id]) {
                var info = this.comments[state.reflection.id];
                if (!isPreferred && (info.isPreferred || info.fullText.length > fullText.length)) {
                    return;
                }

                info.fullText    = fullText;
                info.isPreferred = isPreferred;
            } else {
                this.comments[state.reflection.id] = {
                    reflection:  state.reflection,
                    fullText:    fullText,
                    isPreferred: isPreferred
                };
            }
        }


        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBeginResolve(event:DispatcherEvent) {
            for (var id in this.comments) {
                if (!this.comments.hasOwnProperty(id)) {
                    continue;
                }

                var info    = this.comments[id];
                var comment = CommentHandler.parseDocComment(info.fullText);
                CommentHandler.removeTags(comment, 'preferred');

                info.reflection.comment = comment;
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(ModuleCommentHandler);
}
