module TypeDoc.Factories
{
    /**
     * A handler that truncates the names of dynamic modules to not include the
     * project's base path.
     */
    export class DynamicModuleHandler extends BaseHandler
    {
        /**
         * The ast walker factory.
         */
        private factory:TypeScript.AstWalkerFactory;

        /**
         * Helper class for determining the base path.
         */
        private basePath = new BasePath();

        /**
         * List of reflections whose name must be trimmed.
         */
        private reflections:Models.DeclarationReflection[];

        /**
         * The declaration kinds affected by this handler.
         */
        private affectedKinds:TypeScript.PullElementKind[] = [
            TypeScript.PullElementKind.DynamicModule,
            TypeScript.PullElementKind.Script
        ];


        /**
         * Create a new DynamicModuleHandler instance.
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
            this.basePath.reset();
            this.reflections = [];
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            if (state.kindOf(this.affectedKinds, true) && this.reflections.indexOf(state.reflection) == -1) {
                var name = state.originalDeclaration.name;
                if (name.indexOf('/') == -1) {
                    return;
                }

                name = name.replace(/"/g, '');
                this.reflections.push(state.reflection);
                this.basePath.add(name);

                var ast = <TypeScript.SourceUnit>state.declaration.ast();
                if (ast instanceof TypeScript.SourceUnit) {
                    var resolved = false;
                    this.factory.simpleWalk(ast, (ast:TypeScript.AST, astState:any) => {
                        if (resolved ||
                            ast.kind() == TypeScript.SyntaxKind.SourceUnit ||
                            ast.kind() == TypeScript.SyntaxKind.List)
                        {
                            return;
                        }

                        var comments = ast.preComments();
                        if (comments && comments.length > 1 && CommentHandler.isDocComment(comments[0])) {
                            state.reflection.comment = CommentHandler.parseDocComment(comments[0].fullText());
                        }

                        resolved = true;
                    });
                }
            }
        }


        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onBeginResolve(event:DispatcherEvent) {
            this.reflections.forEach((reflection) => {
                var name = reflection.name.replace(/"/g, '');
                name = name.substr(0, name.length - Path.extname(name).length);
                reflection.name = '"' + this.basePath.trim(name) + '"';
            });
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(DynamicModuleHandler);
}