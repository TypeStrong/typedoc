module TypeDoc
{
    /**
     * Holds all settings used by TypeDoc.
     */
    export class Settings
    {
        /**
         * The settings used by the TypeScript compiler.
         */
        compiler:TypeScript.CompilationSettings;

        /**
         * The list of source files that should be processed.
         */
        inputFiles:string[];

        /**
         * The path of the output directory.
         */
        outputDirectory:string;

        /**
         * The human readable name of the project. Used within the templates to set the title of the document.
         */
        name:string;

        /**
         * A pattern for files that should be excluded when a path is specified as source.
         */
        excludePattern:string;

        /**
         * Should declaration files be documented?
         */
        includeDeclarations:boolean = false;

        /**
         * Does the user want to display the help message?
         */
        needsHelp:boolean = false;

        /**
         * Does the user want to know the version number?
         */
        shouldPrintVersionOnly:boolean = false;

        /**
         * Should verbose messages be printed?
         */
        verbose:boolean = false;



        /**
         * Create a new Settings instance.
         */
        constructor() {
            this.compiler = new TypeScript.CompilationSettings();
        }


        /**
         * Read the settings from command line arguments.
         */
        readFromCommandline(application:IApplication):boolean {
            var opts = this.createOptionsParser();

            try {
                opts.parse(TypeScript.IO.arguments);
            } catch (e) {
                application.log(e.message, LogLevel.Error);
                return false;
            }

            this.inputFiles = opts.unnamed;

            if (this.shouldPrintVersionOnly) {
                opts.printVersion();
                return false;
            } else if (this.inputFiles.length === 0 || this.needsHelp) {
                opts.printUsage();
                return false;
            }

            return true;
        }


        /**
         * Expand the list of input files.
         *
         * Searches for directories in the input files list and replaces them with a
         * listing of all TypeScript files within them. One may use the exlclude option
         * to filter out files aith a pattern.
         */
        public expandInputFiles() {
            var exclude, files = [];
            if (this.excludePattern) {
                exclude = new Minimatch.Minimatch(this.excludePattern);
            }

            function add(dirname) {
                FS.readdirSync(dirname).forEach((file) => {
                    var realpath = TypeScript.IOUtils.combine(dirname, file);
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


        /**
         * Create and initialize an instance of OptionsParser to read command line arguments.
         *
         * This function partially contains the options found in [[TypeScript.BatchCompiler.parseOptions]].
         * When updating the TypeScript compiler, new options should be copied over here.
         *
         * @returns An initialized OptionsParser instance.
         */
        private createOptionsParser():TypeScript.OptionsParser {
            var opts = new TypeScript.OptionsParser(TypeScript.IO, VERSION);

            opts.option('out', {
                usage: {
                    locCode: 'Specifies the location the documentation should be written to.',
                    args: null
                },
                type: TypeScript.DiagnosticCode.DIRECTORY,
                set: (str) => {
                    this.outputDirectory = Path.resolve(str);
                }
            });

            opts.option('exclude', {
                usage: {
                    locCode: 'Define a pattern for excluded files when specifing paths.',
                    args: null
                },
                set: (str) => {
                    this.excludePattern = str;
                }
            });

            opts.flag('includeDeclarations', {
                usage: {
                    locCode: 'Turn on parsing of .d.ts declaration files.',
                    args: null
                },
                set: () => {
                    this.includeDeclarations = true;
                }
            });

            opts.option('name', {
                usage: {
                    locCode: 'Set the name of the project that will be used in the header of the template.',
                    args: null
                },
                set: (str) => {
                    this.name = str;
                }
            });

            opts.option('verbose', {
                usage: {
                    locCode: 'Print more information while TypeDoc is running.',
                    args: null
                },
                set: (str) => {
                    this.name = str;
                }
            });


            // Copied from TypeScript

            opts.option('mapRoot', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
                    args: null
                },
                type: TypeScript.DiagnosticCode.LOCATION,
                set: (str) => {
                    this.compiler.mapRoot = str;
                }
            });

            opts.flag('propagateEnumConstants', {
                experimental: true,
                set: () => { this.compiler.propagateEnumConstants = true; }
            });

            opts.flag('noResolve', {
                experimental: true,
                usage: {
                    locCode: TypeScript.DiagnosticCode.Skip_resolution_and_preprocessing,
                    args: null
                },
                set: () => {
                    this.compiler.noResolve = true;
                }
            });

            opts.flag('noLib', {
                experimental: true,
                set: () => {
                    this.compiler.noLib = true;
                }
            });

            opts.flag('diagnostics', {
                experimental: true,
                set: () => {
                    this.compiler.gatherDiagnostics = true;
                }
            });

            opts.flag('logFile', {
                experimental: true,
                set: () => {
                    this.compiler.createFileLog = true;
                }
            });

            opts.option('target', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_ECMAScript_target_version_0_default_or_1,
                    args: ['ES3', 'ES5']
                },
                type: TypeScript.DiagnosticCode.VERSION,
                set: (type) => {
                    type = type.toLowerCase();

                    if (type === 'es3') {
                        this.compiler.codeGenTarget = TypeScript.LanguageVersion.EcmaScript3;
                    }
                    else if (type === 'es5') {
                        this.compiler.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
                    }
                    else {
                        throw new Error(TypeScript.DiagnosticCode.ECMAScript_target_version_0_not_supported_Specify_a_valid_target_version_1_default_or_2);
                    }
                }
            }, 't');

            opts.option('module', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_module_code_generation_0_or_1,
                    args: ['commonjs', 'amd']
                },
                type: TypeScript.DiagnosticCode.KIND,
                set: (type) => {
                    type = type.toLowerCase();

                    if (type === 'commonjs') {
                        this.compiler.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                    }
                    else if (type === 'amd') {
                        this.compiler.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                    }
                    else {
                        throw new Error(TypeScript.DiagnosticCode.Module_code_generation_0_not_supported);
                    }
                }
            }, 'm');

            opts.flag('help', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Print_this_message,
                    args: null
                },
                set: () => {
                    this.needsHelp = true;
                }
            }, 'h');

            opts.flag('useCaseSensitiveFileResolution', {
                experimental: true,
                set: () => {
                    this.compiler.useCaseSensitiveFileResolution = true;
                }
            });

            opts.flag('version', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Print_the_compiler_s_version_0,
                    args: [VERSION]
                },
                set: () => {
                    this.shouldPrintVersionOnly = true;
                }
            }, 'v');

            opts.flag('noImplicitAny', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Warn_on_expressions_and_declarations_with_an_implied_any_type,
                    args: null
                },
                set: () => {
                    this.compiler.noImplicitAny = true;
                }
            });

            if (TypeScript.Environment.supportsCodePage()) {
                opts.option('codepage', {
                    usage: {
                        locCode: TypeScript.DiagnosticCode.Specify_the_codepage_to_use_when_opening_source_files,
                        args: null
                    },
                    type: TypeScript.DiagnosticCode.NUMBER,
                    set: (arg) => {
                        this.compiler.codepage = parseInt(arg, 10);
                    }
                });
            }

            return opts;
        }
    }
}