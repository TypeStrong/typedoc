module TypeDoc.Output
{
    /**
     * An event emitted by the [[Renderer]] class at the before and after the
     * markup of a page is rendered.
     *
     * This object will be passed as the rendering context to the handlebars template.
     *
     * @see [[Renderer.EVENT_BEGIN_PAGE]]
     * @see [[Renderer.EVENT_END_PAGE]]
     */
    export class OutputPageEvent extends Event
    {
        /**
         * The project the renderer is currently processing.
         */
        project:Models.ProjectReflection;

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
        navigation:Models.NavigationItem;

        /**
         * The secondary navigation structure of this page.
         */
        secondary:Models.NavigationItem[];

        /**
         * The html content of this page.
         */
        contents:string;
    }
}