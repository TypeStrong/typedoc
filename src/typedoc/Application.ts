module TypeDoc
{
    /**
     * The TypeDoc main application class.
     */
    export class Application
    {
        settings:Settings;

        dispatcher:Factories.Dispatcher;

        renderer:Renderer.Renderer;

        hasErrors:boolean = false;

        static VERSION:string = '0.0.4';


        /**
         * Create a new Application instance.
         */
        constructor(settings:Settings = new Settings()) {
            this.settings   = settings;
            this.dispatcher = new Factories.Dispatcher(this);
            this.renderer   = new Renderer.Renderer(this);
        }


        runFromCLI() {
            if (this.settings.readFromCLI()) {
                this.settings.expandInputFiles();
                this.generate(this.settings.inputFiles, this.settings.outputDirectory);
                console.log('Documentation generated at ' + this.settings.outputDirectory);
            }
        }


        /**
         * Run the documentation generator for the given files.
         */
        public generate(inputFiles:string[], outputDirectory:string) {
            var project = this.dispatcher.compile(inputFiles);
            this.renderer.render(project, outputDirectory);
        }
    }
}