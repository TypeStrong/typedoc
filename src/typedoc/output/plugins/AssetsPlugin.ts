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
                FS.mkdirRecursiveSync(to);
                AssetsPlugin.copyRecursiveSync(from, to);
            }
        }


        /**
         * Look ma, it's cp -R.
         *
         * @param src   The path to the thing to copy.
         * @param dest  The path to the new copy.
         *
         * @see http://stackoverflow.com/a/22185855
         */
        static copyRecursiveSync(src, dest) {
            var exists      = FS.existsSync(src);
            var stats       = exists && FS.statSync(src);
            var isDirectory = exists && stats.isDirectory();

            if (exists && isDirectory) {
                if (!FS.existsSync(dest)) {
                    FS.mkdirSync(dest);
                }

                FS.readdirSync(src).forEach(function(childItemName) {
                    AssetsPlugin.copyRecursiveSync(
                        Path.join(src, childItemName),
                        Path.join(dest, childItemName)
                    );
                });
            } else {
                if (!FS.existsSync(dest)) {
                    FS.linkSync(src, dest);
                }
            }
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.PLUGIN_CLASSES.push(AssetsPlugin);
}