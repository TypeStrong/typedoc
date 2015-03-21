module td.converter
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
        private reflections:models.Reflection[];


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
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context:Context) {
            this.basePath.reset();
            this.reflections = [];
        }


        /**
         * Triggered when the converter has created a declaration reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context:Context, reflection:models.Reflection, node?:ts.Node) {
            if (reflection.kindOf(models.ReflectionKind.ExternalModule)) {
                var name = reflection.name;
                if (name.indexOf('/') == -1) {
                    return;
                }

                name = name.replace(/"/g, '');
                this.reflections.push(reflection);
                this.basePath.add(name);
            }
        }


        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context:Context) {
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
    Converter.registerPlugin('dynamicModule', DynamicModulePlugin);
}