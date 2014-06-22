module TypeDoc.Factories
{
    /**
     * A handler that filters declarations that should be ignored and prevents
     * the creation of reflections for them.
     *
     * TypeDoc currently ignores all type aliases, object literals, object types and
     * implicit variables. Furthermore declaration files are ignored.
     */
    export class NullHandler extends BaseHandler
    {
        /**
         * Should declaration files be documented?
         */
        private includeDeclarations:boolean = false;

        /**
         * An array of all declaration kinds that should be ignored.
         */
        private ignoredKinds:TypeScript.PullElementKind[] = [
            TypeScript.PullElementKind.ObjectLiteral,
            TypeScript.PullElementKind.ObjectType,
            TypeScript.PullElementKind.TypeAlias,
            TypeScript.PullElementKind.FunctionType,
            TypeScript.PullElementKind.FunctionExpression
        ];


        /**
         * Create a new NullHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN,             this.onBegin,            this, 1024);
            dispatcher.on(Dispatcher.EVENT_BEGIN_DOCUMENT,    this.onBeginDocument,    this, 1024);
            dispatcher.on(Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event:DispatcherEvent) {
            this.includeDeclarations = this.dispatcher.application.settings.includeDeclarations;
        }


        /**
         * Triggered when the dispatcher starts processing a TypeScript document.
         *
         * Prevents `lib.d.ts` from being processed.
         * Prevents declaration files from being processed depending on [[Settings.excludeDeclarations]].
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(state:DocumentState) {
            if (state.document.isDeclareFile()) {
                if (!this.includeDeclarations || state.document.fileName.substr(-8) == 'lib.d.ts') {
                    this.dispatcher.application.log(
                        Util.format('Skipping declaration file %s', state.document.fileName),
                        LogLevel.Verbose);

                    state.stopPropagation();
                    state.preventDefault();
                }
            }
        }


        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * Ignores all type aliases, object literals and types.
         * Ignores all implicit variables.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDeclaration(state:DeclarationState) {
            if (state.kindOf(this.ignoredKinds)) {
                state.stopPropagation();
                state.preventDefault();
            }

            if (state.kindOf(Models.Kind.Variable) && state.hasFlag(Models.Flags.ImplicitVariable)) {
                state.stopPropagation();
                state.preventDefault();
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(NullHandler);
}