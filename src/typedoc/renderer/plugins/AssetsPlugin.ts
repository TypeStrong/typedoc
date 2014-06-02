module TypeDoc.Renderer
{
    export class AssetsPlugin extends BasePlugin
    {
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on('beginTarget', (t) => this.onRendererBeginTarget(t));
        }


        private onRendererBeginTarget(target:Models.RenderTarget) {
            var ready = false;
            var from = TypeScript.IOUtils.combine(this.renderer.theme.basePath, 'assets');
            if (this.renderer.ioHost.fileExists(from)) {
                var to = Path.join(target.dirname, 'assets');
                FS.mkdirRecursiveSync(to);
                FS.copyRecursive(from, to, (e) => {  });
            }
        }
    }


    Renderer.PLUGIN_CLASSES.push(AssetsPlugin);
}