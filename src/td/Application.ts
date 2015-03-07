/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */
module td
{
    /**
     * An interface of the application class.
     *
     * All classes should expect this interface allowing other third parties
     * to use their own implementation.
     */
    export interface IApplication
    {
        /**
         * The options used by the dispatcher and the renderer.
         */
        options:IOptions;

        /**
         * The options used by the TypeScript compiler.
         */
        compilerOptions:ts.CompilerOptions;

        /**
         * The logger that should be used to output messages.
         */
        logger:Logger;
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
         * The options used by the dispatcher and the renderer.
         */
        options:IOptions;

        /**
         * The options used by the TypeScript compiler.
         */
        compilerOptions:ts.CompilerOptions;

        /**
         * The converter used to create the declaration reflections.
         */
        converter:Converter;

        /**
         * The renderer used to generate the documentation output.
         */
        renderer:Renderer;

        /**
         * The logger that should be used to output messages.
         */
        logger:Logger;

        /**
         * The version number of the loaded TypeScript compiler.
         * Cached return value of [[Application.getTypeScriptVersion]]
         */
        private typeScriptVersion:string;

        /**
         * The version number of TypeDoc.
         */
        static VERSION:string = '{{ VERSION }}';



        /**
         * @param options An object containing the options that should be used.
         */
        constructor(options?:IOptions);

        /**
         * @param fromCommandLine  TRUE if the application should execute in command line mode.
         */
        constructor(fromCommandLine:boolean);

        /**
         * Create a new TypeDoc Application instance.
         */
        constructor(arg?:any) {
            this.converter = new Converter(this);
            this.renderer  = new Renderer(this);
            this.logger    = new ConsoleLogger();
            this.options   = OptionsParser.createOptions();
            this.compilerOptions = OptionsParser.createCompilerOptions();

            if (!arg || typeof arg == 'object') {
                this.bootstrapWithOptions(arg);
            } else if (arg === true) {
                this.bootstrapFromCommandline();
            }
        }


        private bootstrap() {
            if (typeof this.options.logger == 'function') {
                this.logger = new CallbackLogger(<any>this.options.logger);
            } else if (this.options.logger == LoggerType.None) {
                this.logger = new Logger();
            }
        }


        /**
         * Run TypeDoc from the command line.
         */
        private bootstrapFromCommandline() {
            var parser = new OptionsParser(this);
            parser.addCommandLineParameters();
            parser.parseArguments(null, true);

            this.bootstrap();

            this.collectParameters(parser);
            if (!parser.parseArguments()) {
                return;
            }

            if (this.options.version) {
                ts.sys.write(this.toString());
            } else if (parser.inputFiles.length === 0 || this.options.help) {
                ts.sys.write(parser.toString());
            } else if (!this.options.out && !this.options.json) {
                this.logger.error("You must either specify the 'out' or 'json' option.");
            } else {
                var src = this.expandInputFiles(parser.inputFiles);
                var project = this.convert(src);
                if (project) {
                    if (this.options.out) this.generateDocs(project, this.options.out);
                    if (this.options.json) this.generateJson(project, this.options.json);
                }
            }
        }


        private bootstrapWithOptions(options?:IOptions) {
            var parser = new OptionsParser(this);
            parser.parseObject(options, true);

            this.bootstrap();
            this.collectParameters(parser);

            parser.parseObject(options);
        }


        public collectParameters(parser:OptionsParser) {
            parser.addParameter(this.converter.getParameters());
            parser.addParameter(this.renderer.getParameters());
        }




        /**
         * Run the converter for the given set of files and return the generated reflections.
         *
         * @param src  A list of source that should be compiled and converted.
         * @returns An instance of ProjectReflection on success, NULL otherwise.
         */
        public convert(src:string[]):ProjectReflection {
            this.logger.writeln('Using TypeScript %s from %s', this.getTypeScriptVersion(), tsPath);

            var result = this.converter.convert(src);
            if (result.errors && result.errors.length) {
                this.logger.diagnostics(result.errors);
                return null;
            } else {
                return result.project;
            }
        }


        /**
         * @param src  A list of source files whose documentation should be generated.
         */
        public generateDocs(src:string[], out:string):boolean;

        /**
         * @param project  The project the documentation should be generated for.
         */
        public generateDocs(project:ProjectReflection, out:string):boolean;

        /**
         * Run the documentation generator for the given set of files.
         *
         * @param out  The path the documentation should be written to.
         * @returns TRUE if the documentation could be generated successfully, otherwise FALSE.
         */
        public generateDocs(input:any, out:string):boolean {
            var project = input instanceof ProjectReflection ? input : this.convert(input);
            if (!project) return false;

            out = Path.resolve(out);
            this.renderer.render(project, out);
            if (this.logger.hasErrors()) {
                this.logger.error('Documentation could not be generated due to the errors above.');
            } else {
                this.logger.success('Documentation generated at %s', out);
            }

            return true;
        }


        /**
         * @param src  A list of source that should be compiled and converted.
         */
        public generateJson(src:string[], out:string):boolean;

        /**
         * @param project  The project that should be converted.
         */
        public generateJson(project:ProjectReflection, out:string):boolean;

        /**
         * Run the converter for the given set of files and write the reflections to a json file.
         *
         * @param out  The path and file name of the target file.
         * @returns TRUE if the json file could be written successfully, otherwise FALSE.
         */
        public generateJson(input:any, out:string):boolean {
            var project = input instanceof ProjectReflection ? input : this.convert(input);
            if (!project) return false;

            out = Path.resolve(out);
            writeFile(out, JSON.stringify(project.toObject(), null, '\t'), false);
            this.logger.success('JSON written to %s', out);

            return true;
        }


        /**
         * Expand a list of input files.
         *
         * Searches for directories in the input files list and replaces them with a
         * listing of all TypeScript files within them. One may use the ```--exclude``` option
         * to filter out files with a pattern.
         *
         * @param inputFiles  The list of files that should be expanded.
         * @returns  The list of input files with expanded directories.
         */
        public expandInputFiles(inputFiles?:string[]):string[] {
            var exclude, files = [];
            if (this.options.exclude) {
                exclude = new Minimatch.Minimatch(this.options.exclude);
            }

            function add(dirname) {
                FS.readdirSync(dirname).forEach((file) => {
                    var realpath = Path.join(dirname, file);
                    if (FS.statSync(realpath).isDirectory()) {
                        add(realpath);
                    } else if (/\.ts$/.test(realpath)) {
                        if (exclude && exclude.match(realpath.replace(/\\/g, '/'))) {
                            return;
                        }

                        files.push(realpath);
                    }
                });
            }

            inputFiles.forEach((file) => {
                file = Path.resolve(file);
                if (FS.statSync(file).isDirectory()) {
                    add(file);
                } else {
                    files.push(file);
                }
            });

            return files;
        }


        /**
         * Return the version number of the loaded TypeScript compiler.
         *
         * @returns The version number of the loaded TypeScript package.
         */
        public getTypeScriptVersion():string {
            if (!this.typeScriptVersion) {
                var json = JSON.parse(FS.readFileSync(Path.join(tsPath, '..', 'package.json'), 'utf8'));
                this.typeScriptVersion = json.version;
            }

            return this.typeScriptVersion;
        }


        /**
         * Print the version number.
         */
        public toString() {
            return [
                '',
                'TypeDoc ' + Application.VERSION,
                'Using TypeScript ' + this.getTypeScriptVersion() + ' from ' + tsPath,
                ''
            ].join(ts.sys.newLine);
        }
    }
}