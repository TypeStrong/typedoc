module TypeDoc.Factories
{
    /**
     * A factory that creates signature reflections.
     */
    export class ResolveHandler
    {
        constructor(private dispatcher:Dispatcher) {
            dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 1024);
        }


        onEnterDeclaration(state:DeclarationState) {
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


    Dispatcher.HANDLERS.push(ResolveHandler);
}