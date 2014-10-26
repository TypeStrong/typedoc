module TypeDoc.Output
{
    /**
     * An event emitted by the [[Renderer]] class at the very beginning and
     * ending of the entire rendering process.
     *
     * @see [[Renderer.EVENT_BEGIN]]
     * @see [[Renderer.EVENT_END]]
     */
    export class OutputEvent extends Event
    {
        /**
         * The project the renderer is currently processing.
         */
        project:Models.ProjectReflection;

        /**
         * The settings that have been passed to TypeDoc.
         */
        settings:Settings;

        /**
         * The path of the directory the documentation should be written to.
         */
        outputDirectory:string;

        /**
         * A list of all pages that should be generated.
         *
         * This list can be altered during the [[Renderer.EVENT_BEGIN]] event.
         */
        urls:Models.UrlMapping[];


        /**
         * Create an [[OutputPageEvent]] event based on this event and the given url mapping.
         *
         * @internal
         * @param mapping  The mapping that defines the generated [[OutputPageEvent]] state.
         * @returns A newly created [[OutputPageEvent]] instance.
         */
        public createPageEvent(mapping:Models.UrlMapping):OutputPageEvent {
            var event = new OutputPageEvent();
            event.project      = this.project;
            event.settings     = this.settings;
            event.url          = mapping.url;
            event.model        = mapping.model;
            event.templateName = mapping.template;
            event.filename     = Path.join(this.outputDirectory, mapping.url);
            return event;
        }
    }
}