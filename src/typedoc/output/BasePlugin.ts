module TypeDoc.Output
{
    export class BasePlugin
    {
        renderer:Renderer;


        constructor(renderer:Renderer) {
            this.renderer = renderer;
        }
    }
}