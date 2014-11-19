module td
{
    /**
     * A handler that truncates the names of dynamic modules to not include the
     * project's base path.
     */
    export class DynamicModulePlugin extends ConverterPlugin
    {
        /**
         * Helper class for determining the base path.
         */
        private basePath = new BasePath();

        /**
         * List of reflections whose name must be trimmed.
         */
        private reflections:Reflection[];


        /**
         * Create a new DynamicModuleHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_BEGIN,              this.onBegin,        this);
            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration,  this);
            converter.on(Converter.EVENT_RESOLVE_BEGIN,      this.onBeginResolve, this);
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event:ConverterEvent) {
            this.basePath.reset();
            this.reflections = [];
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event:CompilerEvent) {
            if (event.reflection.kindOf(ReflectionKind.ExternalModule)) {
                var name = event.reflection.name;
                if (name.indexOf('/') == -1) {
                    return;
                }

                name = name.replace(/"/g, '');
                this.reflections.push(event.reflection);
                this.basePath.add(name);
            }
        }


        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onBeginResolve(event:ConverterEvent) {
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
    Converter.registerPlugin('DynamicModulePlugin', DynamicModulePlugin);
}