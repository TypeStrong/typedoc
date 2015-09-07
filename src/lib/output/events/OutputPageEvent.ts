module td.output
{
    /**
     * An event emitted by the [[Renderer]] class before and after the
     * markup of a page is rendered.
     *
     * This object will be passed as the rendering context to handlebars templates.
     *
     * @see [[Renderer.EVENT_BEGIN_PAGE]]
     * @see [[Renderer.EVENT_END_PAGE]]
     */
    export class OutputPageEvent extends Event
    {
        /**
         * The project the renderer is currently processing.
         */
        project:models.ProjectReflection;

        /**
         * The settings that have been passed to TypeDoc.
         */
        settings:IOptions;

        /**
         * The filename the page will be written to.
         */
        filename:string;

        /**
         * The url this page will be located at.
         */
        url:string;

        /**
         * The model that should be rendered on this page.
         */
        model:any;

        /**
         * The template that should be used to render this page.
         */
        template:IHandlebarTemplate;

        /**
         * The name of the template that should be used to render this page.
         */
        templateName:string;

        /**
         * The primary navigation structure of this page.
         */
        navigation:NavigationItem;

        /**
         * The table of contents structure of this page.
         */
        toc:NavigationItem;

        /**
         * The final html content of this page.
         *
         * Should be rendered by layout templates and can be modifies by plugins.
         */
        contents:string;
    }
}
