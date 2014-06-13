module TypeDoc.Output
{
    /**
     * A plugin that wraps the generated output with a layout template.
     *
     * Currently only a default layout is supported. The layout must be stored
     * as ´layouts/default.hbs´ in the theme directory.
     */
    export class LunrPlugin extends BasePlugin
    {
        /**
         * Create a new LayoutPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        }


        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererBegin(event:OutputEvent) {
            var rows = [];

            event.project.reflections.forEach((reflection) => {
                if (!reflection.url || reflection.kindOf(Models.Kind.Parameter)) {
                    return;
                }

                if ((<Models.DeclarationReflection>reflection).signatures) {
                    return;
                }

                var parent = reflection.parent;
                if (parent instanceof Models.ProjectReflection) {
                    parent = null;
                } else if ((<Models.DeclarationReflection>parent).signatures) {
                    parent = parent.parent;
                }

                var row:any = {
                    id: rows.length,
                    kind:   reflection.kind,
                    name:   reflection.name,
                    url:    reflection.url
                };

                if (parent) {
                    row.parent = parent.getFullName();
                }

                if (reflection.type) {
                    row.type = reflection.type.toString();
                }

                if (reflection.comment && reflection.comment.shortText) {
                    row.body = reflection.comment.shortText;
                }

                rows.push(row);
            });

            var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'index.json');
            TypeScript.IOUtils.writeFileAndFolderStructure(TypeScript.IO, fileName, JSON.stringify({rows:rows}), true);
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.PLUGIN_CLASSES.push(LunrPlugin);
}