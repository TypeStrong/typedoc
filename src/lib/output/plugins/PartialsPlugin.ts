module td.output
{
    /**
     * A plugin that loads all partials of the current theme.
     *
     * Partials must be placed in the ´partials´ subdirectory of the theme. The plugin first
     * loads the partials of the default theme and then the partials of the current theme.
     */
    export class PartialsPlugin extends RendererPlugin
    {
        /**
         * Create a new PartialsPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        }


        /**
         * Load all files in the given directory and registers them as partials.
         *
         * @param path  The path of the directory that should be scanned.
         */
        private loadPartials(path:string) {
            if (!FS.existsSync(path) || !FS.statSync(path).isDirectory()) {
                return;
            }

            FS.readdirSync(path).forEach((fileName:string) => {
                var file = Path.join(path, fileName);
                var name = Path.basename(fileName, Path.extname(fileName));
                Handlebars.registerPartial(name, Renderer.readFile(file));
            });
        }


        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event:DocumentEvent) {
            var themePath = Path.join(this.renderer.theme.basePath, 'partials');
            var defaultPath = Path.join(Renderer.getDefaultTheme(), 'partials');

            if (themePath != defaultPath) {
                this.loadPartials(defaultPath);
            }

            this.loadPartials(themePath);
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('partials', PartialsPlugin);
}