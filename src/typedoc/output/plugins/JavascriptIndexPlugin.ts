module TypeDoc.Output
{
    /**
     * A plugin that exports an index of the project to a javascript file.
     *
     * The resulting javascript file can be used to build a simple search function.
     */
    export class JavascriptIndexPlugin extends BasePlugin
    {
        /**
         * Create a new JavascriptIndexPlugin instance.
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
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event:OutputEvent) {
            var rows = [];
            var kinds = {};

            event.project.reflections.forEach((reflection) => {
                if (!reflection.url ||
                    !reflection.name ||
                    reflection.isExternal ||
                    reflection.name == '' ||
                    reflection.kindOf(Models.Kind.Parameter))
                    return;

                var parent = reflection.parent;
                if (parent instanceof Models.ProjectReflection) {
                    parent = null;
                } else if ((<Models.DeclarationReflection>parent).signatures) {
                    return;
                }

                var row:any = {
                    id: rows.length,
                    kind:    reflection.kind,
                    name:    reflection.name,
                    url:     reflection.url,
                    classes: reflection.cssClasses
                };

                if (parent) {
                    row.parent = parent.getFullName();
                }

                if (!kinds[reflection.kind]) {
                    kinds[reflection.kind] = Factories.GroupHandler.getKindSingular(reflection.kind);
                }

                rows.push(row);
            });

            var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
            var data =
                'var tsd = tsd || {};' +
                'tsd.search = tsd.search || {};' +
                'tsd.search.data = ' + JSON.stringify({kinds:kinds, rows:rows}) + ';';

            TypeScript.IOUtils.writeFileAndFolderStructure(TypeScript.IO, fileName, data, true);
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.PLUGIN_CLASSES.push(JavascriptIndexPlugin);
}