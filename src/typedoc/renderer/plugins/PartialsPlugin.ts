module TypeDoc.Renderer
{
    export class PartialsPlugin extends BasePlugin
    {
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on('beginTarget', (t) => this.onRendererBeginTarget(t));
        }


        private onRendererBeginTarget(target:Models.RenderTarget) {
            var dirName = Path.join(this.renderer.theme.basePath, 'partials');
            var partials = this.renderer.ioHost.dir(dirName);

            partials.forEach((partial) => {
                var name = Path.basename(partial, Path.extname(partial));
                Handlebars.registerPartial(name, readFile(partial));
            });
        }
    }


    Renderer.PLUGIN_CLASSES.push(PartialsPlugin);
}