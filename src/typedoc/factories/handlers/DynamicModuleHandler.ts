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
            if (state.kindOf(this.affectedKinds) && !state.hasFlag(TypeScript.PullElementFlags.Ambient)) {
                var name = state.declaration.name;
                if (name.indexOf('/') == -1) {
                    return;
                }

                name = name.replace(/"/g, '');
                state.reflection.name = name.substr(0, name.length - Path.extname(name).length);
                this.reflections.push(state.reflection);

                if (name.indexOf('/') != -1) {
                    this.basePath.add(name);
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
                reflection.name = this.basePath.trim(reflection.name);
            });
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(DynamicModuleHandler);
}