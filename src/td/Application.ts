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
         * The settings used by the dispatcher and the renderer.
         */
        settings:Settings;

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
         * The settings used by the dispatcher and the renderer.
         */
        settings:Settings;

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
         * The version number of TypeDoc.
         */
        static VERSION:string = '{{ VERSION }}';



        /**
         * Create a new Application instance.
         *
         * @param settings  The settings used by the dispatcher and the renderer.
         */
        constructor(settings:Settings = new Settings()) {
            this.settings  = settings;
            this.converter = new Converter();
            this.renderer  = new Renderer(this);
        }


        /**
         * Run TypeDoc from the command line.
         */
        public runFromCommandline() {
            if (this.settings.parseCommandLine(this)) {
                if (this.settings.version) {
                    ts.sys.write(this.printVersion().join(ts.sys.newLine));
                } else if (this.settings.inputFiles.length === 0 || this.settings.help) {
                    ts.sys.write(this.printUsage().join(ts.sys.newLine));
                } else {
                    ts.sys.write(ts.sys.newLine);
                    this.log(Util.format('Using TypeScript %s from %s', this.getTypeScriptVersion(), tsPath), LogLevel.Info);

                    this.settings.expandInputFiles();
                    this.settings.out = Path.resolve(this.settings.out);
                    this.generate(this.settings.inputFiles, this.settings.out);

                    if (this.hasErrors) {
                        ts.sys.write(ts.sys.newLine);
                        this.log('Documentation could not be generated due to the errors above.');
                    }
                }
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
                var output = '';
                if (level == LogLevel.Error) output += 'Error: ';
                if (level == LogLevel.Warn) output += 'Warning: ';
                output += message;

                ts.sys.write(output + ts.sys.newLine);
            }
        }


        /**
         * Run the documentation generator for the given set of files.
         *
         * @param inputFiles  A list of source files whose documentation should be generated.
         * @param outputDirectory  The path of the directory the documentation should be written to.
         */
        public generate(inputFiles:string[], outputDirectory:string):boolean {
            var result = this.converter.convert(inputFiles, this.settings);

            if (result.errors && result.errors.length) {
                result.errors.forEach((error) => {
                    var output = error.file.filename;
                    output += '(' + error.file.getLineAndCharacterFromPosition(error.start).line + ')';
                    output += ts.sys.newLine + ' ' + error.messageText;

                    switch (error.category) {
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

                return false;
            }

            if (this.settings.json) {
                writeFile(this.settings.json, JSON.stringify(result.project.toObject(), null, '\t'), false);
                this.log(Util.format('JSON written to %s', this.settings.json));
            } else {
                this.renderer.render(result.project, outputDirectory);
                this.log(Util.format('Documentation generated at %s', this.settings.out));
            }

            return true;
        }


        /**
         * Return the version number of the loaded TypeScript compiler.
         *
         * @returns The version number of the loaded TypeScript package.
         */
        public getTypeScriptVersion():string {
            var json = JSON.parse(FS.readFileSync(Path.join(tsPath, '..', 'package.json'), 'utf8'));
            return json.version;
        }


        /**
         * Print the version number.
         *
         * @return string[]
         */
        public printVersion() {
            return [
                '',
                'TypeDoc ' + Application.VERSION,
                'Using TypeScript ' + this.getTypeScriptVersion() + ' at ' + tsPath,
                ''
            ];
        }


        /**
         * Print some usage information.
         *
         * Taken from TypeScript (src/compiler/tsc.ts)
         *
         * @return string[]
         */
        public printUsage() {
            var marginLength = 0;
            var typeDoc = prepareOptions(optionDeclarations);
            var typeScript = prepareOptions(ts.optionDeclarations, ignoredTypeScriptOptions);

            var output = this.printVersion();

            output.push('Usage:');
            output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
            output.push('', 'TypeDoc options:');
            pushDeclarations(typeDoc);
            output.push('', 'TypeScript options:');
            pushDeclarations(typeScript);
            output.push('');
            return output;

            function prepareOptions(optsList:ts.CommandLineOption[], exclude?:string[]):{usage:string[]; description:string[];} {
                // Sort our options by their names, (e.g. "--noImplicitAny" comes before "--watch")
                optsList = optsList.slice();
                optsList.sort((a, b) => ts.compareValues<string>(a.name.toLowerCase(), b.name.toLowerCase()));

                // We want our descriptions to align at the same column in our output,
                // so we keep track of the longest option usage string.
                var usageColumn: string[] = []; // Things like "-d, --declaration" go in here.
                var descriptionColumn: string[] = [];

                for (var i = 0; i < optsList.length; i++) {
                    var option = optsList[i];
                    if (exclude && exclude.indexOf(option.name) != -1) continue;

                    // If an option lacks a description,
                    // it is not officially supported.
                    if (!option.description) {
                        continue;
                    }

                    var usageText = " ";
                    if (option.shortName) {
                        usageText += "-" + option.shortName;
                        usageText += getParamType(option);
                        usageText += ", ";
                    }

                    usageText += "--" + option.name;
                    usageText += getParamType(option);

                    usageColumn.push(usageText);
                    descriptionColumn.push(option.description.key);

                    // Set the new margin for the description column if necessary.
                    marginLength = Math.max(usageText.length, marginLength);
                }

                return {usage:usageColumn, description:descriptionColumn};
            }

            // Special case that can't fit in the loop.
            function addFileOption(columns:{usage:string[]; description:string[];}) {
                var usageText = " @<file>";
                columns.usage.push(usageText);
                columns.description.push(ts.Diagnostics.Insert_command_line_options_and_files_from_a_file.key);
                marginLength = Math.max(usageText.length, marginLength);
            }

            // Print out each row, aligning all the descriptions on the same column.
            function pushDeclarations(columns:{usage:string[]; description:string[];}) {
                for (var i = 0; i < columns.usage.length; i++) {
                    var usage = columns.usage[i];
                    var description = columns.description[i];
                    output.push(usage + makePadding(marginLength - usage.length + 2) + description);
                }
            }

            function getParamType(option:ts.CommandLineOption) {
                if (option.paramType !== undefined) {
                    return " " + getDiagnosticText(option.paramType);
                }
                return "";
            }

            function getDiagnosticText(message:ts.DiagnosticMessage, ...args: any[]): string {
                var diagnostic:ts.Diagnostic = ts.createCompilerDiagnostic.apply(undefined, arguments);
                return diagnostic.messageText;
            }

            function makePadding(paddingLength: number): string {
                return Array(paddingLength + 1).join(" ");
            }
        }
    }
}