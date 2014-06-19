module TypeDoc.Factories
{
    /**
     * A handler that truncates the names of dynamic modules to not include the
     * project's base path.
     */
    export class DynamicModuleHandler extends BaseHandler
    {
        /**
         * Helper class for determining the base path.
         */
        private basePath = new BasePath();

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

            dispatcher.on(Dispatcher.EVENT_DECLARATION, this.onDeclaration, this);
            dispatcher.on(Dispatcher.EVENT_RESOLVE,     this.onResolve,     this);
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            if (state.kindOf(this.affectedKinds)) {
                var name = state.declaration.name;
                name = name.replace(/"/g, '');
                state.reflection.name = name.substr(0, name.length - Path.extname(name).length);

                if (name.indexOf('/') != -1) {
                    this.basePath.add(name);
                }
            }
        }


        /**
         * Triggered when the dispatcher resolves a reflection.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event:ReflectionEvent) {
            var reflection = event.reflection;
            if (reflection.kindOf(this.affectedKinds)) {
                if (reflection.name.indexOf('/') != -1) {
                    reflection.name = this.basePath.trim(reflection.name);
                }
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(DynamicModuleHandler);
}