/// <reference path="EventDispatcher.ts" />
/// <reference path="Settings.ts" />

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


    export interface ILogger {
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         */
        log(message:string, level?:LogLevel):void;
    }


    /**
     * An interface of the application class.
     *
     * All classes should expect this interface allowing other third parties
     * to use their own implementation.
     */
    export interface IApplication extends ILogger
    {
        /**
         * The options used by the dispatcher and the renderer.
         */
        options:IOptions;

        /**
         * The options used by the TypeScript compiler.
         */
        compilerOptions:ts.CompilerOptions;
    }


    var existingDirectories:ts.Map<boolean> = {};

    export function normalizePath(path:string) {
        return ts.normalizePath(path);
    }


    export function writeFile(fileName:string, data:string, writeByteOrderMark:boolean, onError?:(message:string) => void) {
        function directoryExists(directoryPath: string): boolean {
            if (ts.hasProperty(existingDirectories, directoryPath)) {
                return true;
            }
            if (ts.sys.directoryExists(directoryPath)) {
                existingDirectories[directoryPath] = true;
                return true;
            }
            return false;
        }

        function ensureDirectoriesExist(directoryPath: string) {
            if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
                var parentDirectory = ts.getDirectoryPath(directoryPath);
                ensureDirectoriesExist(parentDirectory);
                ts.sys.createDirectory(directoryPath);
            }
        }

        try {
            ensureDirectoriesExist(ts.getDirectoryPath(ts.normalizePath(fileName)));
            ts.sys.writeFile(fileName, data, writeByteOrderMark);
        }
        catch (e) {
            if (onError) onError(e.message);
        }
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
    export class Application implements ILogger, IApplication
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
         * Has an error been raised through the log method?
         */
        hasErrors:boolean = false;

        /**
         * The version number of the loaded TypeScript compiler. Cached return value of [[Application.getTypeScriptVersion]]
         */
        private typeScriptVersion:string;

        /**
         * The version number of TypeDoc.
         */
        static VERSION:string = '{{ VERSION }}';



        /**
         * Create a new Application instance.
         */
        constructor() {
            this.converter = new Converter(this);
            this.renderer  = new Renderer(this);
            this.options   = OptionsParser.createOptions();
            this.compilerOptions = OptionsParser.createCompilerOptions();
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

            if (level != LogLevel.Verbose || this.options.verbose) {
                var output = '';
                if (level == LogLevel.Error) output += 'Error: ';
                if (level == LogLevel.Warn) output += 'Warning: ';
                output += message;

                ts.sys.write(output + ts.sys.newLine);
            }
        }


        logDiagnostics(diagnostics:ts.Diagnostic[]) {
            diagnostics.forEach((msg) => {
                var output;
                if (msg.file) {
                    output = msg.file.filename;
                    output += '(' + msg.file.getLineAndCharacterFromPosition(msg.start).line + ')';
                    output += ts.sys.newLine + ' ' + msg.messageText;
                } else {
                    output = msg.messageText;
                }

                switch (msg.category) {
                    case ts.DiagnosticCategory.Error:
                        this.log(output, LogLevel.Error);
                        break;
                    case ts.DiagnosticCategory.Warning:
                        this.log(output, LogLevel.Warn);
                        break;
                    case ts.DiagnosticCategory.Message:
                        this.log(output, LogLevel.Info);
                }
            });
        }


        /**
         * Run the documentation generator for the given set of files.
         *
         * @param src  A list of source files whose documentation should be generated.
         * @param out  The path of the directory the documentation should be written to.
         */
        public generateDocs(src:string[], out:string):boolean {
            var result = this.converter.convert(src);
            if (result.errors && result.errors.length) {
                this.logDiagnostics(result.errors);
                return false;
            }

            this.renderer.render(result.project, out);
            if (this.hasErrors) {
                ts.sys.write(ts.sys.newLine);
                this.log('Documentation could not be generated due to the errors above.');
            } else {
                this.log(Util.format('Documentation generated at %s', out));
            }

            return true;
        }


        public generateJson(src:string[], out:string):boolean {
            var result = this.converter.convert(src);
            if (result.errors && result.errors.length) {
                this.logDiagnostics(result.errors);
                return false;
            }

            writeFile(out, JSON.stringify(result.project.toObject(), null, '\t'), false);
            this.log(Util.format('JSON written to %s', out));

            return true;
        }


        /**
         * Run TypeDoc from the command line.
         */
        public runFromCommandline() {
            var parser = new OptionsParser(this);
            parser.addCommandLineParameters();
            parser.parseArguments(null, true);

            // TODO: Load plugins and set theme

            var parameters:IParameter[] = [];
            parameters.push.call(parameters, this.converter.getParameters());
            parameters.push.call(parameters, this.renderer.getParameters());
            parser.addParameter.call(parser, parameters);

            if (parser.parseArguments()) {
                if (this.options.version) {
                    ts.sys.write(this.toString());
                } else if (parser.inputFiles.length === 0 || this.options.help) {
                    ts.sys.write(parser.toString());
                } else if (this.options.out) {
                    ts.sys.write(ts.sys.newLine);
                    this.log(Util.format('Using TypeScript %s from %s', this.getTypeScriptVersion(), tsPath), LogLevel.Info);

                    var src = this.expandInputFiles(parser.inputFiles);
                    var out = Path.resolve(this.options.out);
                    this.generateDocs(src, out);
                } else if (this.options.json) {
                    var src = this.expandInputFiles(parser.inputFiles);
                    var out = Path.resolve(this.options.json);
                    this.generateJson(src, out);
                } else {
                    this.log('You must either specify the \'out\' or \'json\' parameter.', LogLevel.Error);
                }
            }
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