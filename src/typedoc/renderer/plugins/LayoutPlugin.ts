module TypeDoc.Renderer
{
    export class LayoutPlugin extends BasePlugin
    {
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on('endOutput', (o) => this.onRendererEndOutput(o));
        }


        private onRendererEndOutput(output:Models.RenderOutput) {
            var layout = this.renderer.getTemplate('layouts/default.hbs');
            output.contents = layout(output);
        }
    }


    Renderer.PLUGIN_CLASSES.push(LayoutPlugin);
}