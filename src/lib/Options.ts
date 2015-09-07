declare module td
{
    /**
     * Options object interface declaration.
     *
     * Other components might add additional option declarations.
     */
    export interface IOptions
    {
        /**
         * The path of the theme that should be used.
         */
        theme:string;

        /**
         * The list of npm plugins that should be loaded.
         */
        plugins?:string[];

        /**
         * A pattern for files that should be excluded when a path is specified as source.
         */
        exclude?:string;

        /**
         * The path of the output directory.
         */
        out?:string;

        /**
         * Path and filename of the json file.
         */
        json?:string;

        /**
         * Should TypeDoc generate documentation pages even after the compiler has returned errors?
         */
        ignoreCompilerErrors?:boolean;

        /**
         * Does the user want to display the help message?
         */
        help?:boolean;

        /**
         * Should we display some extra debug information?
         */
        verbose?:boolean;

        /**
         * Does the user want to know the version number?
         */
        version?:boolean;

        /**
         * Which logger should be used to record messages?
         */
        logger?:LoggerType;
    }
}


module td
{
    export enum ModuleKind {
        None = 0,
        CommonJS = 1,
        AMD = 2,
    }

    export enum ScriptTarget {
        ES3 = 0,
        ES5 = 1,
        ES6 = 2,
        Latest = 2,
    }

    export enum SourceFileMode {
        File, Modules
    }


    export interface IParameter
    {
        name:string;
        short?:string;
        help:string;
        type?:ParameterType;
        hint?:ParameterHint;
        scope?:ParameterScope;
        map?:{};
        mapError?:string;
        isArray?:boolean;
        defaultValue?:any;
        convert?:(param:IParameter, value?:any) => any;
    }

    export interface IParameterHelp {
        names:string[];
        helps:string[];
        margin:number;
    }

    export interface IParameterProvider
    {
        /**
         * Return a list of parameters introduced by this component.
         *
         * @returns A list of parameter definitions introduced by this component.
         */
        getParameters():IParameter[];
    }

    export enum ParameterHint {
        File,
        Directory
    }

    export enum ParameterType {
        String,
        Number,
        Boolean,
        Map
    }


    export enum ParameterScope {
        TypeDoc, TypeScript
    }


    /**
     * A parser that can read command line arguments, option files and javascript objects.
     */
    export class OptionsParser
    {
        /**
         * The list of discovered input files.
         */
        inputFiles:string[] = [];

        /**
         * The application that stores the parsed settings.
         */
        private application:IApplication;

        /**
         * Map of parameter names and their definitions.
         */
        private arguments:ts.Map<IParameter> = {};

        /**
         * Map of parameter short names and their full equivalent.
         */
        private shortNames:ts.Map<string> = {};

        /**
         * A list of all TypeScript parameters that should be ignored.
         */
        private static IGNORED_TS_PARAMS:string[] = [
            'out', 'outDir', 'version', 'help',
            'watch', 'declaration', 'mapRoot',
            'sourceMap', 'removeComments'
        ];

        /**
         * The name of the parameter that specifies the options file.
         */
        private static OPTIONS_KEY:string = 'options';



        /**
         * Create a new OptionsParser instance.
         *
         * @param application  The application that stores the parsed settings
         */
        constructor(application:IApplication) {
            this.application = application;

            this.addDefaultParameters();
            this.addCompilerParameters();
        }


        /**
         * @param parameters One or multiple parameter definitions that should be registered.
         */
        addParameter(parameters:IParameter[]);

        /**
         * @param rest One or multiple parameter definitions that should be registered.
         */
        addParameter(...rest:IParameter[]);

        /**
         * Register one or multiple parameter definitions.
         */
        addParameter(...args) {
            args.forEach((param) => {
                if (Util.isArray(param)) {
                    this.addParameter.apply(this, param);
                    return;
                }

                param.type = param.type || ParameterType.String;
                param.scope = param.scope || ParameterScope.TypeDoc;
                this.arguments[param.name.toLowerCase()] = param;

                if (param.short) {
                    this.shortNames[param.short.toLowerCase()] = param.name;
                }

                if (param.defaultValue && !param.isArray) {
                    var name = param.name;
                    var target = (param.scope == ParameterScope.TypeDoc) ? this.application.options : this.application.compilerOptions;
                    if (!target[name]) {
                        target[name] = param.defaultValue;
                    }
                }
            });
        }


        /**
         * Register the command line parameters.
         */
        addCommandLineParameters() {
            this.addParameter({
                name:  'out',
                help:  'Specifies the location the documentation should be written to.',
                hint:  ParameterHint.Directory
            }, {
                name:  'json',
                help:  'Specifies the location and file name a json file describing the project is written to.',
                hint:  ParameterHint.File
            },{
                name:  'version',
                short: 'v',
                help:  'Print the TypeDoc\'s version.',
                type:  ParameterType.Boolean
            },{
                name:  'help',
                short: 'h',
                help:  'Print this message.',
                type:  ParameterType.Boolean
            });
        }


        /**
         * Register the default parameters.
         */
        private addDefaultParameters() {
            this.addParameter({
                name: 'theme',
                help: 'Specify the path to the theme that should be used or \'default\' or \'minimal\' to use built-in themes.',
                type: ParameterType.String
            },{
                name: OptionsParser.OPTIONS_KEY,
                help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
                type: ParameterType.String,
                hint: ParameterHint.File
            },{
                name: 'exclude',
                help: 'Define a pattern for excluded files when specifying paths.',
                type: ParameterType.String
            },{
                name: 'ignoreCompilerErrors',
                help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
                type: ParameterType.Boolean
            },{
                name: 'plugin',
                help: 'Specify the npm plugins that should be loaded. Omit to load all installed plugins, set to \'none\' to load no plugins.',
                type: ParameterType.String,
                isArray: true
            },{
                name: 'verbose',
                help: 'Should TypeDoc print additional debug information?',
                type: ParameterType.Boolean
            },{
                name: 'logger',
                help: 'Specify the logger that should be used, \'none\' or \'console\'',
                defaultValue: LoggerType.Console,
                type: ParameterType.Map,
                map: {
                    'none': LoggerType.None,
                    'console': LoggerType.Console
                },
                convert: (param:IParameter, value?:any) => {
                    if (typeof value == 'function') {
                        return value;
                    } else {
                        return OptionsParser.convert(param, value);
                    }
                }
            });
        }


        /**
         * Register all TypeScript related properties.
         */
        private addCompilerParameters() {
            var ignored = OptionsParser.IGNORED_TS_PARAMS;

            ts.optionDeclarations.forEach((option:ts.CommandLineOption) => {
                if (ignored.indexOf(option.name) != -1) return;
                var param = <IParameter>{
                    name:  option.name,
                    short: option.shortName,
                    help:  option.description ? option.description.key : null,
                    scope: ParameterScope.TypeScript
                };

                switch (option.type) {
                    case "number":
                        param.type = ParameterType.Number;
                        break;
                    case "boolean":
                        param.type = ParameterType.Boolean;
                        break;
                    case "string":
                        param.type = ParameterType.String;
                        break;
                    default:
                        param.type = ParameterType.Map;
                        param.map = option.type;
                        if (option.error) {
                            var error = ts.createCompilerDiagnostic(option.error);
                            param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                        }
                }

                switch (option.paramType) {
                    case ts.Diagnostics.FILE:
                        param.hint = ParameterHint.File;
                        break;
                    case ts.Diagnostics.DIRECTORY:
                        param.hint = ParameterHint.Directory;
                        break;
                }

                this.addParameter(param);
            });
        }


        /**
         * Add an input/source file.
         *
         * The input files will be used as source files for the compiler. All command line
         * arguments without parameter will be interpreted as being input files.
         *
         * @param fileName The path and filename of the input file.
         */
        addInputFile(fileName:string) {
            this.inputFiles.push(fileName);
        }


        /**
         * Retrieve a parameter by its name.
         *
         * @param name  The name of the parameter to look for.
         * @returns The parameter definition or NULL when not found.
         */
        getParameter(name:string):IParameter {
            name = name.toLowerCase();

            if (ts.hasProperty(this.shortNames, name)) {
                name = this.shortNames[name];
            }

            if (ts.hasProperty(this.arguments, name)) {
                return this.arguments[name];
            } else {
                return null;
            }
        }


        /**
         * Return all parameters within the given scope.
         *
         * @param scope  The scope the parameter list should be filtered for.
         * @returns All parameters within the given scope
         */
        getParametersByScope(scope:ParameterScope):IParameter[] {
            var parameters = [];
            for (var key in this.arguments) {
                if (!this.arguments.hasOwnProperty(key)) continue;
                var argument = this.arguments[key];
                if (argument.scope === scope) {
                    parameters.push(argument);
                }
            }

            return parameters;
        }


        /**
         * Set the option described by the given parameter description to the given value.
         *
         * @param param  The parameter description of the option to set.
         * @param value  The target value of the option.
         * @returns TRUE on success, otherwise FALSE.
         */
        setOption(param:IParameter, value?:any):boolean {
            if (param.isArray && Util.isArray(value)) {
                var result = true;
                value.forEach((value) => result = this.setOption(param, value) && result);
                return result;
            }

            try {
                if (param.convert) {
                    value = param.convert(param, value);
                } else {
                    value = OptionsParser.convert(param, value);
                }
            } catch (error) {
                this.application.logger.error(error.message);
                return false;
            }

            var name = param.name;
            var target = (param.scope == ParameterScope.TypeDoc) ? this.application.options : this.application.compilerOptions;
            if (param.isArray) {
                (target[name] = target[name] || []).push(value);
            } else {
                target[name] = value;
            }

            return true;
        }


        /**
         * Try to find and load an option file from command line arguments.
         *
         * An option file can either be specified using the command line argument ``--option`` or must
         * be a file named ``typedoc.js`` within the current directory.
         *
         * @param args  The list of arguments that should be parsed. When omitted the
         *   current command line arguments will be used.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        loadOptionFileFromArguments(args?:string[], ignoreUnknownArgs?:boolean):boolean {
            args = args || process.argv.slice(2);
            var index = 0;
            var optionFile;
            while (index < args.length) {
                var arg = args[index++];
                if (arg.charCodeAt(0) !== ts.CharacterCodes.minus) {
                    continue;
                }

                arg = arg.slice(arg.charCodeAt(1) === ts.CharacterCodes.minus ? 2 : 1).toLowerCase();
                if (arg == OptionsParser.OPTIONS_KEY && args[index]) {
                    optionFile = Path.resolve(args[index]);
                    break;
                }
            }

            if (!optionFile) {
                optionFile = Path.resolve('typedoc.js');
                if (!FS.existsSync(optionFile)) {
                    return true;
                }
            }

            return this.loadOptionFile(optionFile, ignoreUnknownArgs);
        }


        /**
         * Try to load an option file from a settings object.
         *
         * @param obj  The object whose properties should be applied.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        loadOptionFileFromObject(obj:any, ignoreUnknownArgs?:boolean):boolean {
            if (typeof obj != 'object') return true;
            if (!obj[OptionsParser.OPTIONS_KEY]) {
                return true;
            }

            return this.loadOptionFile(obj[OptionsParser.OPTIONS_KEY], ignoreUnknownArgs);
        }


        /**
         * Load the specified option file.
         *
         * @param optionFile  The absolute path and file name of the option file.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        loadOptionFile(optionFile:string, ignoreUnknownArgs?:boolean):boolean {
            if (!FS.existsSync(optionFile)) {
                this.application.logger.error('The specified option file %s does not exist.', optionFile);
                return false;
            }

            var data = require(optionFile);
            if (typeof data == 'function') {
                data = data(this.application, td);
            }

            if (!(typeof data == 'object')) {
                this.application.logger.error('The option file %s could not be read, it must either export a function or an object.', optionFile);
                return false;
            } else {
                if (data.src) {
                    if (typeof data.src == 'string') {
                        this.inputFiles = [data.src];
                    } else if (Util.isArray(data.src)) {
                        this.inputFiles = data.src;
                    } else {
                        this.application.logger.error('The property \'src\' of the option file %s must be a string or an array.', optionFile);
                    }

                    delete data.src;
                }

                return this.parseObject(data, ignoreUnknownArgs);
            }
        }


        /**
         * Apply the values of the given options object.
         *
         * @param obj  The object whose properties should be applied.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        parseObject(obj:any, ignoreUnknownArgs?:boolean):boolean {
            if (typeof obj != 'object') return true;
            var logger = this.application.logger;
            var result = true;

            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;

                var parameter = this.getParameter(key);
                if (!parameter) {
                    if (!ignoreUnknownArgs) {
                        logger.error('Unknown option: %s', key);
                        result = false;
                    }
                } else {
                    result = this.setOption(parameter, obj[key]) && result;
                }
            }

            return result;
        }


        /**
         * Read and store the given list of arguments.
         *
         * @param args  The list of arguments that should be parsed. When omitted the
         *   current command line arguments will be used.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        parseArguments(args?:string[], ignoreUnknownArgs?:boolean):boolean {
            var index = 0;
            var result = true;
            var logger = this.application.logger;
            args = args || process.argv.slice(2);

            while (index < args.length) {
                var arg = args[index++];

                if (arg.charCodeAt(0) === ts.CharacterCodes.at) {
                    result = this.parseResponseFile(arg.slice(1), ignoreUnknownArgs) && result;
                } else if (arg.charCodeAt(0) === ts.CharacterCodes.minus) {
                    arg = arg.slice(arg.charCodeAt(1) === ts.CharacterCodes.minus ? 2 : 1).toLowerCase();

                    var parameter = this.getParameter(arg);
                    if (!parameter) {
                        if (ignoreUnknownArgs) continue;
                        logger.error('Unknown option: %s', arg);
                        return false;
                    } else if (parameter.type !== ParameterType.Boolean) {
                        if (!args[index]) {
                            if (ignoreUnknownArgs) continue;
                            logger.error('Option "%s" expects an argument', parameter.name);
                            return false;
                        } else {
                            result = this.setOption(parameter, args[index++]) && result;
                        }
                    } else {
                        result = this.setOption(parameter, true) && result;
                    }
                } else if (!ignoreUnknownArgs) {
                    this.addInputFile(arg);
                }
            }

            return result;
        }


        /**
         * Read the arguments stored in the given file.
         *
         * @param filename  The path and filename that should be parsed.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored?
         * @returns TRUE on success, otherwise FALSE.
         */
        parseResponseFile(filename:string, ignoreUnknownArgs?:boolean):boolean {
            var text = ts.sys.readFile(filename);
            var logger = this.application.logger;

            if (!text) {
                logger.error('File not found: "%s"', filename);
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
                        logger.error('Unterminated quoted string in response file "%s"', filename);
                        return false;
                    }
                } else {
                    while (text.charCodeAt(pos) > ts.CharacterCodes.space) pos++;
                    args.push(text.substring(start, pos));
                }
            }

            return this.parseArguments(args, ignoreUnknownArgs);
        }


        /**
         * Prepare parameter information for the [[toString]] method.
         *
         * @param scope  The scope of the parameters whose help should be returned.
         * @returns The columns and lines for the help of the requested parameters.
         */
        private getParameterHelp(scope:ParameterScope):IParameterHelp {
            var parameters = this.getParametersByScope(scope);
            parameters.sort((a, b) => {
                return <number>ts.compareValues<string>(a.name.toLowerCase(), b.name.toLowerCase())
            });

            var names:string[] = [];
            var helps:string[] = [];
            var margin = 0;

            for (var i = 0; i < parameters.length; i++) {
                var parameter = parameters[i];
                if (!parameter.help) continue;

                var name = " ";
                if (parameter.short) {
                    name += "-" + parameter.short;
                    if (typeof parameter.hint != 'undefined') {
                        name += ' ' + ParameterHint[parameter.hint].toUpperCase();
                    }
                    name += ", ";
                }

                name += "--" + parameter.name;
                if (parameter.hint) name += ' ' + ParameterHint[parameter.hint].toUpperCase();

                names.push(name);
                helps.push(parameter.help);
                margin = Math.max(name.length, margin);
            }

            return {names:names, helps:helps, margin:margin};
        }


        /**
         * Print some usage information.
         *
         * Taken from TypeScript (src/compiler/tsc.ts)
         */
        public toString():string {
            var typeDoc = this.getParameterHelp(ParameterScope.TypeDoc);
            var typeScript = this.getParameterHelp(ParameterScope.TypeScript);
            var margin = Math.max(typeDoc.margin, typeScript.margin);

            var output = [];
            output.push('Usage:');
            output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');

            output.push('', 'TypeDoc options:');
            pushHelp(typeDoc);

            output.push('', 'TypeScript options:');
            pushHelp(typeScript);

            output.push('');
            return output.join(ts.sys.newLine);

            function pushHelp(columns:IParameterHelp) {
                for (var i = 0; i < columns.names.length; i++) {
                    var usage = columns.names[i];
                    var description = columns.helps[i];
                    output.push(usage + padding(margin - usage.length + 2) + description);
                }
            }

            function padding(length: number): string {
                return Array(length + 1).join(" ");
            }
        }


        /**
         * Convert the given value according to the type setting of the given parameter.
         *
         * @param param  The parameter definition.
         * @param value  The value that should be converted.
         * @returns The converted value.
         */
        static convert(param:IParameter, value?:any):any {
            switch (param.type) {
                case ParameterType.Number:
                    value = parseInt(value);
                    break;
                case ParameterType.Boolean:
                    value = (typeof value == 'undefined' ? true : !!value);
                    break;
                case ParameterType.String:
                    value = value || "";
                    break;
                case ParameterType.Map:
                    var map = <ts.Map<number>>param.map;
                    var key = value ? (value + "").toLowerCase() : '';
                    if (ts.hasProperty(map, key)) {
                        value = map[key];
                    } else if (param.mapError) {
                        throw new Error(param.mapError);
                    } else {
                        throw new Error(Util.format('Invalid option given for option "%s".', param.name));
                    }
                    break;
            }

            return value;
        }


        /**
         * Create an options object populated with the default values.
         *
         * @returns An options object populated with default values.
         */
        static createOptions():IOptions {
            return {
                theme: 'default'
            };
        }


        /**
         * Create the compiler options populated with the default values.
         *
         * @returns A compiler options object populated with default values.
         */
        static createCompilerOptions():ts.CompilerOptions {
            return <ts.CompilerOptions>{
                target: ts.ScriptTarget.ES3,
                module: ts.ModuleKind.None
            };
        }
    }
}