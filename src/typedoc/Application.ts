module TypeDoc
{
    /**
     * List of known log levels. Used to specify the urgency of a log message.
     *
     * @see [[Application.log]]
     */
    export enum LogLevel {
        Verbose,
        Info,
        Warn,
        Error
    }


    /**
     * An interface of the application class.
     *
     * All classes should expect this interface allowing other third parties
     * to use their own implementation.
     */
    export interface IApplication
    {
        /**
         * The settings used by the dispatcher and the renderer.
         */
        settings:Settings;

        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         */
        log(message:string, level?:LogLevel):void;
    }


    /**
     * The default TypeDoc main application class.
     *
     * This class holds the two main components of TypeDoc, the [[Dispatcher]] and
     * the [[Renderer]]. When running TypeDoc, first the [[Dispatcher]] is invoked which
     * generates a [[ProjectReflection]] from the passed in source files. The
     * [[ProjectReflection]] is a hierarchical model representation of the TypeScript
     * project. Afterwards the model is passed to the [[Renderer]] which uses an instance
     * of [[BaseTheme]] to generate the final documentation.
     *
     * Both the [[Dispatcher]] and the [[Renderer]] are subclasses of the [[EventDispatcher]]
     * and emit a series of events while processing the project. Subscribe to these Events
     * to control the application flow or alter the output.
     */
    export class Application implements IApplication
    {
        /**
         * The settings used by the dispatcher and the renderer.
         */
        settings:Settings;

        /**
         * The dispatcher used to create the declaration reflections.
         */
        dispatcher:Factories.Dispatcher;

        /**
         * The renderer used to generate the documentation output.
         */
        renderer:Output.Renderer;

        /**
         * Has an error been raised through the log method?
         */
        hasErrors:boolean = false;

        /**
         * The version number of TypeDoc.
         */
        static VERSION:string = '0.0.4';



        /**
         * Create a new Application instance.
         *
         * @param settings  The settings used by the dispatcher and the renderer.
         */
        constructor(settings:Settings = new Settings()) {
            this.settings   = settings;
            this.dispatcher = new Factories.Dispatcher(this);
            this.renderer   = new Output.Renderer(this);
        }


        /**
         * Run TypeDoc from the command line.
         */
        public runFromCommandline() {
            if (this.settings.readFromCommandline(this)) {
                this.settings.expandInputFiles();
                this.generate(this.settings.inputFiles, this.settings.outputDirectory);
                this.log(Util.format('Documentation generated at %s', this.settings.outputDirectory));
            }
        }


        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level    The urgency of the log message.
         */
        log(message:string, level:LogLevel = LogLevel.Info) {
            if (level == LogLevel.Error) {
                this.hasErrors = true;
            }

            if (level != LogLevel.Verbose || this.settings.verbose) {
                console.log(message);
            }
        }


        /**
         * Run the documentation generator for the given set of files.
         *
         * @param inputFiles  A list of source files whose documentation should be generated.
         * @param outputDirectory  The path of the directory the documentation should be written to.
         */
        public generate(inputFiles:string[], outputDirectory:string) {
            var project = this.dispatcher.createProject(inputFiles);
            this.renderer.render(project, outputDirectory);
        }
    }
}