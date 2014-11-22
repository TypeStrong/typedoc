module td
{
    /**
     * Alias to ts.ScriptTarget
     * @resolve
     */
    export var ScriptTarget:typeof ts.ScriptTarget = ts.ScriptTarget;

    /**
     * Alias to ts.ModuleKind
     * @resolve
     */
    export var ModuleKind:typeof ts.ModuleKind = ts.ModuleKind;


    export enum OptionScope {
        TypeDoc, TypeScript
    }


    export interface IOptionDeclaration extends ts.CommandLineOption {
        scope:OptionScope;
    }


    export var ignoredTypeScriptOptions = [
        'out', 'outDir'
    ];


    /**
     * Modify ts.optionDeclarations to match TypeDoc requirements.
     */
    export var optionDeclarations:IOptionDeclaration[] = [{
        name: "out",
        type: "string",
        scope: OptionScope.TypeDoc,
        paramType: ts.Diagnostics.DIRECTORY,
        description: {
            key: 'Specifies the location the documentation should be written to.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "mode",
        type: {
            'file': 'file',
            'modules': 'modules'
        },
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Specifies the output mode the project is used to be compiled with.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "json",
        type: "string",
        scope: OptionScope.TypeDoc,
        paramType: ts.Diagnostics.DIRECTORY,
        description: {
            key: 'Specifies the location and file name a json file describing the project is written to.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "theme",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Specify the path to the theme that should be used.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "exclude",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Define a pattern for excluded files when specifying paths.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "includeDeclarations",
        type: "boolean",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Turn on parsing of .d.ts declaration files.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "externalPattern",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Define a pattern for files that should be considered being external.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "readme",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "excludeExternals",
        type: "boolean",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Prevent externally resolved TypeScript files from being documented.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "name",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Set the name of the project that will be used in the header of the template.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "gaID",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Set the Google Analytics tracking ID and activate tracking code.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "gaSite",
        type: "string",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Set the site name for Google Analytics. Defaults to `auto`.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "hideGenerator",
        type: "boolean",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Do not print the TypeDoc link at the end of the page.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    },{
        name: "verbose",
        type: "boolean",
        scope: OptionScope.TypeDoc,
        description: {
            key: 'Print more information while TypeDoc is running.',
            category: ts.DiagnosticCategory.Message,
            code: 0
        }
    }];


    /**
     * Holds all settings used by TypeDoc.
     */
    export class Settings
    {
        /**
         * The settings used by the TypeScript compiler.
         *
         * @see [[CodeGenTarget]]
         * @see [[ModuleGenTarget]]
         */
        compilerOptions:ts.CompilerOptions;

        /**
         * The list of source files that should be processed.
         */
        inputFiles:string[] = [];

        /**
         * The path of the output directory.
         */
        out:string;

        /**
         * Specifies the output mode the project is used to be compiled with.
         */
        mode:string = 'modules';

        /**
         * Path and filename of the json file.
         */
        json:string;

        /**
         * The path of the theme that should be used.
         */
        theme:string = 'default';

        /**
         * The human readable name of the project. Used within the templates to set the title of the document.
         */
        name:string;

        /**
         * The location of the readme file that should be displayed on the index page. Set this to 'none' to
         * remove the index page and start with the globals page.
         */
        readme:string;

        /**
         * A pattern for files that should be excluded when a path is specified as source.
         */
        excludePattern:string;

        /**
         * Should declaration files be documented?
         */
        includeDeclarations:boolean = false;

        /**
         * Should externally resolved TypeScript files be ignored?
         */
        excludeExternals:boolean = false;

        /**
         * Define a pattern for files that should be considered being external.
         */
        externalPattern:string;

        /**
         * The Google Analytics tracking ID that should be used. When not set, the tracking code
         * should be omitted.
         */
        gaID:string;

        /**
         * Optional site name for Google Analytics. Defaults to `auto`.
         */
        gaSite:string = 'auto';

        /**
         * Does the user want to display the help message?
         */
        needsHelp:boolean = false;

        /**
         * Does the user want to know the version number?
         */
        shouldPrintVersionOnly:boolean = false;

        /**
         * Should we hide the TypeDoc link at the end of the page?
         */
        hideGenerator:boolean = false;

        /**
         * Should verbose messages be printed?
         */
        verbose:boolean = false;

        private declarations:ts.Map<IOptionDeclaration> = {};

        private shortOptionNames:ts.Map<string> = {};



        /**
         * Create a new Settings instance.
         */
        constructor() {
            this.compilerOptions = {
                target: ScriptTarget.ES3,
                module: ModuleKind.None
            };

            optionDeclarations.forEach((option) => this.addOptionDeclaration(option));
            ts.optionDeclarations.forEach((option:IOptionDeclaration) => {
                if (ignoredTypeScriptOptions.indexOf(option.name) != -1) return;
                option.scope = OptionScope.TypeScript;
                this.addOptionDeclaration(option);
            });
        }


        /**
         *
         * @param option
         */
        addOptionDeclaration(option:IOptionDeclaration) {
            this.declarations[option.name.toLowerCase()] = option;
            if (option.shortName) {
                this.shortOptionNames[option.shortName] = option.name;
            }
        }


        /**
         *
         * @param name
         * @returns {*}
         */
        getOptionDeclaration(name:string):IOptionDeclaration {
            if (ts.hasProperty(this.shortOptionNames, name)) {
                name = this.shortOptionNames[name];
            }

            if (ts.hasProperty(this.declarations, name)) {
                return this.declarations[name];
            } else {
                return null;
            }
        }


        /**
         * Expand the list of input files.
         *
         * Searches for directories in the input files list and replaces them with a
         * listing of all TypeScript files within them. One may use the ```--excludePattern``` option
         * to filter out files with a pattern.
         */
        public expandInputFiles() {
            var exclude, files = [];
            if (this.excludePattern) {
                exclude = new Minimatch.Minimatch(this.excludePattern);
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

            this.inputFiles.forEach((file) => {
                file = Path.resolve(file);
                if (FS.statSync(file).isDirectory()) {
                    add(file);
                } else {
                    files.push(file);
                }
            });

            this.inputFiles = files;
        }


        parseCommandLine(logger:ILogger):boolean {
            return this.parseArguments(sys.args, logger);
        }


        parseArguments(args:string[], logger:ILogger):boolean {
            var index = 0;
            var result = true;
            while (index < args.length) {
                var arg = args[index++];

                if (arg.charCodeAt(0) === ts.CharacterCodes.at) {
                    result = this.parseResponseFile(arg.slice(1), logger) && result;
                } else if (arg.charCodeAt(0) === ts.CharacterCodes.minus) {
                    arg = arg.slice(arg.charCodeAt(1) === ts.CharacterCodes.minus ? 2 : 1).toLowerCase();

                    var error, option = this.getOptionDeclaration(arg);
                    if (!option) {
                        error = ts.createCompilerDiagnostic(ts.Diagnostics.Unknown_compiler_option_0, arg);
                    } else if (!args[index] && option.type !== "boolean") {
                        error = ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_expects_an_argument, option.name);
                    }

                    if (error) {
                        logger.log(error.messageText, LogLevel.Error);
                        result = false;
                        continue;
                    }

                    var target:any = option.scope == OptionScope.TypeDoc ? this : this.compilerOptions;
                    switch (option.type) {
                        case "number":
                            target[option.name] = parseInt(args[index++]);
                            break;
                        case "boolean":
                            target[option.name] = true;
                            break;
                        case "string":
                            target[option.name] = args[index++] || "";
                            break;
                        default:
                            var value = (args[index++] || "").toLowerCase();
                            if (ts.hasProperty(option.type, value)) {
                                target[option.name] = option.type[value];
                            } else {
                                if (option.error) {
                                    error = ts.createCompilerDiagnostic(option.error);
                                    logger.log(error.messageText, LogLevel.Error);
                                } else {
                                    logger.log(Util.format('Invalid option given for option "%s".', option.name), LogLevel.Error);
                                }

                                result = false;
                            }
                    }
                } else {
                    this.inputFiles.push(arg);
                }
            }

            return result;
        }


        parseResponseFile(filename:string, logger:ILogger):boolean {
            var text = sys.readFile(filename);

            if (!text) {
                var error = ts.createCompilerDiagnostic(ts.Diagnostics.File_0_not_found, filename);
                logger.log(error.messageText, LogLevel.Error);
                return false;
            }

            var args:string[] = [];
            var pos = 0;
            while (true) {
                while (pos < text.length && text.charCodeAt(pos) <= ts.CharacterCodes.space) pos++;
                if (pos >= text.length) break;

                var start = pos;
                if (text.charCodeAt(start) === ts.CharacterCodes.doubleQuote) {
                    pos++;
                    while (pos < text.length && text.charCodeAt(pos) !== ts.CharacterCodes.doubleQuote) pos++;
                    if (pos < text.length) {
                        args.push(text.substring(start + 1, pos));
                        pos++;
                    } else {
                        var error = ts.createCompilerDiagnostic(ts.Diagnostics.Unterminated_quoted_string_in_response_file_0, filename);
                        logger.log(error.messageText, LogLevel.Error);
                        return false;
                    }
                } else {
                    while (text.charCodeAt(pos) > ts.CharacterCodes.space) pos++;
                    args.push(text.substring(start, pos));
                }
            }

            return this.parseArguments(args, logger);
        }
    }
}
