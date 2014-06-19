module TypeDoc.Factories
{
    /**
     * A handler that marks files not passed as source files as being external.
     */
    export class ExternalHandler extends BaseHandler
    {
        /**
         * An array of normalized input file names.
         */
        inputFiles:string[];

        /**
         * Should externally resolved TypeScript files be ignored?
         */
        exclude:boolean;

        /**
         * Compiled pattern for files that should be considered being external.
         */
        pattern:any;


        /**
         * Create a new ExternalHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN,          this.onBegin,         this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this);
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event:DispatcherEvent) {
            var settings = this.dispatcher.application.settings;
            this.exclude = settings.excludeExternals;

            this.inputFiles = [];
            event.compiler.inputFiles.forEach((fileName:string) => {
                this.inputFiles.push(fileName.replace(/\\/g, '/'));
            });

            if (settings.externalPattern) {
                this.pattern = new Minimatch.Minimatch(settings.externalPattern);
            } else {
                this.pattern = null;
            }
        }


        /**
         * Triggered when the dispatcher starts processing a TypeScript document.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(state:DocumentState) {
            var fileName   = state.document.fileName.replace(/\\/g, '/');
            var isExternal = this.inputFiles.indexOf(fileName) == -1;

            if (this.pattern) {
                isExternal = isExternal || this.pattern.match(fileName);
            }

            if (this.exclude && isExternal) {
                state.stopPropagation();
                state.preventDefault();
            }

            state.isExternal = isExternal;
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(ExternalHandler);
}