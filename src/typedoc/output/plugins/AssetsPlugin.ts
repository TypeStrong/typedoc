module TypeDoc.Output
{
    /**
     * A plugin that copies the subdirectory ´assets´ from the current themes
     * source folder to the output directory.
     */
    export class AssetsPlugin extends BasePlugin
    {
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
            var from = Path.join(this.renderer.theme.basePath, 'assets');
            if (FS.existsSync(from)) {
                var to = Path.join(event.outputDirectory, 'assets');
                FS.copySync(from, to);
            }
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.PLUGIN_CLASSES.push(AssetsPlugin);
}