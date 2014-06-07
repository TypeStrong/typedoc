module TypeDoc.Factories
{
    /**
     * A handler that analyzes the AST and extracts data not represented by declarations.
     */
    export class AstHandler
    {
        /**
         * The ast walker factory.
         */
        private factory:TypeScript.AstWalkerFactory;


        /**
         * Create a new AstHandler instance.
         *
         * Handlers are created automatically if they are registered in the static Dispatcher.FACTORIES array.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            this.factory = TypeScript.getAstWalkerFactory();
            dispatcher.on('leaveDeclaration', this.onLeaveDeclaration, this);
        }


        /**
         * Triggered when the dispatcher has finished processing a typescript declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        onLeaveDeclaration(state:DeclarationState) {
            if (!state.reflection) return;
            if (state.reflection.kind != TypeScript.PullElementKind.DynamicModule) return;

            var ast = state.declaration.ast();
            this.factory.simpleWalk(ast, (ast:TypeScript.AST, astState:any) => {
                if (ast.kind() == TypeScript.SyntaxKind.ExportAssignment) {
                    var assignment = <TypeScript.ExportAssignment>ast;
                    var reflection = state.reflection.getChildByName(assignment.identifier.text());
                    if (reflection) {
                        reflection.flags = reflection.flags | TypeScript.PullElementFlags.Exported;
                        reflection.isExported = true;
                    }
                }
            });
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.FACTORIES.push(AstHandler);
}