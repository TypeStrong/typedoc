module td
{
    /**
     * Base class of all plugins that can be attached to the [[Renderer]].
     */
    export class BasePlugin
    {
        /**
         * The renderer this plugin is attached to.
         */
        renderer:Renderer;


        /**
         * Create a new BasePlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            this.renderer = renderer;
        }


        /**
         * Remove this plugin from the renderer.
         */
        remove() {
            this.renderer.off(null, null, this);
        }
    }
}