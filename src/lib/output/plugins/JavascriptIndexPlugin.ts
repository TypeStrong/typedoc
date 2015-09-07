module td.output
{
    /**
     * A plugin that exports an index of the project to a javascript file.
     *
     * The resulting javascript file can be used to build a simple search function.
     */
    export class JavascriptIndexPlugin extends RendererPlugin
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

            for (var key in event.project.reflections) {
                var reflection:models.DeclarationReflection = <models.DeclarationReflection>event.project.reflections[key];
                if (!(reflection instanceof models.DeclarationReflection)) continue;

                if (!reflection.url ||
                    !reflection.name ||
                    reflection.flags.isExternal ||
                    reflection.name == '')
                    continue;

                var parent = reflection.parent;
                if (parent instanceof models.ProjectReflection) {
                    parent = null;
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
                    kinds[reflection.kind] = converter.GroupPlugin.getKindSingular(reflection.kind);
                }

                rows.push(row);
            }

            var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
            var data =
                'var typedoc = typedoc || {};' +
                'typedoc.search = typedoc.search || {};' +
                'typedoc.search.data = ' + JSON.stringify({kinds:kinds, rows:rows}) + ';';

            writeFile(fileName, data, true);
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('javascriptIndex', JavascriptIndexPlugin);
}