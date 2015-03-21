module td.output
{
    /**
     * A plugin that copies the subdirectory ´assets´ from the current themes
     * source folder to the output directory.
     */
    export class AssetsPlugin extends RendererPlugin
    {
        /**
         * Should the default assets always be copied to the output directory?
         */
        copyDefaultAssets:boolean = true;


        /**
         * Create a new AssetsPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        }


        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event:OutputEvent) {
            var fromDefault = Path.join(Renderer.getDefaultTheme(), 'assets');
            var to = Path.join(event.outputDirectory, 'assets');

            if (this.copyDefaultAssets) {
                FS.copySync(fromDefault, to);
            } else {
                fromDefault = null;
            }

            var from = Path.join(this.renderer.theme.basePath, 'assets');
            if (from != fromDefault && FS.existsSync(from)) {
                FS.copySync(from, to);
            }
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('assets', AssetsPlugin);
}