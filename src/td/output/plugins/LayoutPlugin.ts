module td.output
{
    /**
     * A plugin that wraps the generated output with a layout template.
     *
     * Currently only a default layout is supported. The layout must be stored
     * as ´layouts/default.hbs´ in the theme directory.
     */
    export class LayoutPlugin extends RendererPlugin
    {
        /**
         * Create a new LayoutPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(Renderer.EVENT_END_PAGE, this.onRendererEndPage, this);
        }


        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererEndPage(page:OutputPageEvent) {
            var layout = this.renderer.getTemplate('layouts/default.hbs');
            page.contents = layout(page);
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('layout', LayoutPlugin);
}