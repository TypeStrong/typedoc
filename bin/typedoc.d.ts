/// <reference path="../src/lib/tsd.d.ts" />
declare module td {
    var Util: any;
    var VM: any;
    var Path: any;
    var Handlebars: HandlebarsStatic;
    var Marked: MarkedStatic;
    var HighlightJS: any;
    var Minimatch: any;
    var FS: any;
    var ShellJS: any;
    var ProgressBar: any;
    var tsPath: string;
}
declare module td {
    interface IListener {
        handler: Function;
        scope: any;
        priority: number;
    }
    /**
     * Base class of all events.
     *
     * Events are emitted by [[EventDispatcher]] and are passed to all
     * handlers registered for the associated event name.
     */
    class Event {
        /**
         * Has [[Event.stopPropagation]] been called?
         */
        isPropagationStopped: boolean;
        /**
         * Has [[Event.preventDefault]] been called?
         */
        isDefaultPrevented: boolean;
        /**
         * Stop the propagation of this event. Remaining event handlers will not be executed.
         */
        stopPropagation(): void;
        /**
         * Prevent the default action associated with this event from being executed.
         */
        preventDefault(): void;
    }
    /**
     * Base class of all objects dispatching events.
     *
     * Events are dispatched by calling [[EventDispatcher.dispatch]]. Events must have a name and
     * they can carry additional arguments that are passed to all handlers. The first argument can
     * be an instance of [[Event]] providing additional functionality.
     */
    class EventDispatcher {
        /**
         * List of all registered handlers grouped by event name.
         */
        private listeners;
        /**
         * Dispatch an event with the given event name.
         *
         * @param event  The name of the event to dispatch.
         * @param args   Additional arguments to pass to the handlers.
         */
        dispatch(event: string, ...args: any[]): void;
        /**
         * Register an event handler for the given event name.
         *
         * @param event     The name of the event the handler should be registered to.
         * @param handler   The callback that should be invoked.
         * @param scope     The scope the callback should be executed in.
         * @param priority  A numeric value describing the priority of the handler. Handlers
         *                  with higher priority will be executed earlier.
         */
        on(event: string, handler: Function, scope?: any, priority?: number): void;
        /**
         * Remove an event handler.
         *
         * @param event    The name of the event whose handlers should be removed.
         * @param handler  The callback that should be removed.
         * @param scope    The scope of the callback that should be removed.
         */
        off(event?: string, handler?: Function, scope?: any): void;
    }
}
/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */
declare module td {
    /**
     * An interface of the application class.
     *
     * All classes should expect this interface allowing other third parties
     * to use their own implementation.
     */
    interface IApplication {
        /**
         * The options used by the dispatcher and the renderer.
         */
        options: IOptions;
        /**
         * The options used by the TypeScript compiler.
         */
        compilerOptions: ts.CompilerOptions;
        /**
         * The logger that should be used to output messages.
         */
        logger: Logger;
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
    class Application extends EventDispatcher implements IApplication {
        /**
         * The options used by the dispatcher and the renderer.
         */
        options: IOptions;
        /**
         * The options used by the TypeScript compiler.
         */
        compilerOptions: ts.CompilerOptions;
        /**
         * The converter used to create the declaration reflections.
         */
        converter: converter.Converter;
        /**
         * The renderer used to generate the documentation output.
         */
        renderer: output.Renderer;
        /**
         * The logger that should be used to output messages.
         */
        logger: Logger;
        /**
         * The version number of the loaded TypeScript compiler.
         * Cached return value of [[Application.getTypeScriptVersion]]
         */
        private typeScriptVersion;
        /**
         *
         * @event
         */
        static EVENT_COLLECT_PARAMETERS: string;
        /**
         * The version number of TypeDoc.
         */
        static VERSION: string;
        /**
         * @param options An object containing the options that should be used.
         */
        constructor(options?: IOptions);
        /**
         * @param fromCommandLine  TRUE if the application should execute in command line mode.
         */
        constructor(fromCommandLine: boolean);
        /**
         * Generic initialization logic.
         */
        private bootstrap();
        /**
         * Run TypeDoc from the command line.
         */
        private bootstrapFromCommandline();
        /**
         * Initialize TypeDoc with the given options object.
         *
         * @param options  The desired options to set.
         */
        private bootstrapWithOptions(options?);
        /**
         * Load the given list of npm plugins.
         *
         * @param plugins  A list of npm modules that should be loaded as plugins. When not specified
         *   this function will invoke [[discoverNpmPlugins]] to find a list of all installed plugins.
         * @returns TRUE on success, otherwise FALSE.
         */
        private loadNpmPlugins(plugins?);
        /**
         * Discover all installed TypeDoc plugins.
         *
         * @returns A list of all npm module names that are qualified TypeDoc plugins.
         */
        private discoverNpmPlugins();
        /**
         * Allow [[Converter]] and [[Renderer]] to add parameters to the given [[OptionsParser]].
         *
         * @param parser  The parser instance the found parameters should be added to.
         */
        collectParameters(parser: OptionsParser): void;
        /**
         * Run the converter for the given set of files and return the generated reflections.
         *
         * @param src  A list of source that should be compiled and converted.
         * @returns An instance of ProjectReflection on success, NULL otherwise.
         */
        convert(src: string[]): models.ProjectReflection;
        /**
         * @param src  A list of source files whose documentation should be generated.
         */
        generateDocs(src: string[], out: string): boolean;
        /**
         * @param project  The project the documentation should be generated for.
         */
        generateDocs(project: models.ProjectReflection, out: string): boolean;
        /**
         * @param src  A list of source that should be compiled and converted.
         */
        generateJson(src: string[], out: string): boolean;
        /**
         * @param project  The project that should be converted.
         */
        generateJson(project: models.ProjectReflection, out: string): boolean;
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
        expandInputFiles(inputFiles?: string[]): string[];
        /**
         * Return the version number of the loaded TypeScript compiler.
         *
         * @returns The version number of the loaded TypeScript package.
         */
        getTypeScriptVersion(): string;
        /**
         * Print the version number.
         */
        toString(): string;
    }
}
declare module td {
    /**
     * List of known log levels. Used to specify the urgency of a log message.
     */
    enum LogLevel {
        Verbose = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Success = 4,
    }
    enum LoggerType {
        None = 0,
        Console = 1,
    }
    /**
     * A logger that will not produce any output.
     *
     * This logger also serves as the ase calls of other loggers as it implements
     * all the required utility functions.
     */
    class Logger {
        /**
         * How many error messages have been logged?
         */
        errorCount: number;
        /**
         * Has an error been raised through the log method?
         */
        hasErrors(): boolean;
        /**
         * Reset the error counter.
         */
        resetErrors(): void;
        /**
         * Log the given message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        write(text: string, ...args: string[]): void;
        /**
         * Log the given message with a trailing whitespace.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        writeln(text: string, ...args: string[]): void;
        /**
         * Log the given success message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        success(text: string, ...args: string[]): void;
        /**
         * Log the given verbose message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        verbose(text: string, ...args: string[]): void;
        /**
         * Log the given warning.
         *
         * @param text  The warning that should be logged.
         * @param args  The arguments that should be printed into the given warning.
         */
        warn(text: string, ...args: string[]): void;
        /**
         * Log the given error.
         *
         * @param text  The error that should be logged.
         * @param args  The arguments that should be printed into the given error.
         */
        error(text: string, ...args: string[]): void;
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        log(message: string, level?: LogLevel, newLine?: boolean): void;
        /**
         * Print the given TypeScript log messages.
         *
         * @param diagnostics  The TypeScript messages that should be logged.
         */
        diagnostics(diagnostics: ts.Diagnostic[]): void;
        /**
         * Print the given TypeScript log message.
         *
         * @param diagnostic  The TypeScript message that should be logged.
         */
        diagnostic(diagnostic: ts.Diagnostic): void;
    }
    /**
     * A logger that outputs all messages to the console.
     */
    class ConsoleLogger extends Logger {
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        log(message: string, level?: LogLevel, newLine?: boolean): void;
    }
    /**
     * A logger that calls a callback function.
     */
    class CallbackLogger extends Logger {
        /**
         * This loggers callback function
         */
        callback: Function;
        /**
         * Create a new CallbackLogger instance.
         *
         * @param callback  The callback that should be used to log messages.
         */
        constructor(callback: Function);
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        log(message: string, level?: LogLevel, newLine?: boolean): void;
    }
}
declare module td {
    /**
     * Options object interface declaration.
     *
     * Other components might add additional option declarations.
     */
    interface IOptions {
        /**
         * The path of the theme that should be used.
         */
        theme: string;
        /**
         * The list of npm plugins that should be loaded.
         */
        plugins?: string[];
        /**
         * A pattern for files that should be excluded when a path is specified as source.
         */
        exclude?: string;
        /**
         * The path of the output directory.
         */
        out?: string;
        /**
         * Path and filename of the json file.
         */
        json?: string;
        /**
         * Should TypeDoc generate documentation pages even after the compiler has returned errors?
         */
        ignoreCompilerErrors?: boolean;
        /**
         * Should TypeDoc disable the testing and cleaning of the output directory?
         */
        disableOutputCheck?: boolean;
        /**
         * Does the user want to display the help message?
         */
        help?: boolean;
        /**
         * Should we display some extra debug information?
         */
        verbose?: boolean;
        /**
         * Does the user want to know the version number?
         */
        version?: boolean;
        /**
         * Which logger should be used to record messages?
         */
        logger?: LoggerType;
    }
}
declare module td {
    enum ModuleKind {
        None = 0,
        CommonJS = 1,
        AMD = 2,
    }
    enum ScriptTarget {
        ES3 = 0,
        ES5 = 1,
        ES6 = 2,
        Latest = 2,
    }
    enum SourceFileMode {
        File = 0,
        Modules = 1,
    }
    interface IParameter {
        name: string;
        short?: string;
        help: string;
        type?: ParameterType;
        hint?: ParameterHint;
        scope?: ParameterScope;
        map?: {};
        mapError?: string;
        isArray?: boolean;
        defaultValue?: any;
        convert?: (param: IParameter, value?: any) => any;
    }
    interface IParameterHelp {
        names: string[];
        helps: string[];
        margin: number;
    }
    interface IParameterProvider {
        /**
         * Return a list of parameters introduced by this component.
         *
         * @returns A list of parameter definitions introduced by this component.
         */
        getParameters(): IParameter[];
    }
    enum ParameterHint {
        File = 0,
        Directory = 1,
    }
    enum ParameterType {
        String = 0,
        Number = 1,
        Boolean = 2,
        Map = 3,
    }
    enum ParameterScope {
        TypeDoc = 0,
        TypeScript = 1,
    }
    /**
     * A parser that can read command line arguments, option files and javascript objects.
     */
    class OptionsParser {
        /**
         * The list of discovered input files.
         */
        inputFiles: string[];
        /**
         * The application that stores the parsed settings.
         */
        private application;
        /**
         * Map of parameter names and their definitions.
         */
        private arguments;
        /**
         * Map of parameter short names and their full equivalent.
         */
        private shortNames;
        /**
         * A list of all TypeScript parameters that should be ignored.
         */
        private static IGNORED_TS_PARAMS;
        /**
         * The name of the parameter that specifies the options file.
         */
        private static OPTIONS_KEY;
        /**
         * Create a new OptionsParser instance.
         *
         * @param application  The application that stores the parsed settings
         */
        constructor(application: IApplication);
        /**
         * @param parameters One or multiple parameter definitions that should be registered.
         */
        addParameter(parameters: IParameter[]): any;
        /**
         * @param rest One or multiple parameter definitions that should be registered.
         */
        addParameter(...rest: IParameter[]): any;
        /**
         * Register the command line parameters.
         */
        addCommandLineParameters(): void;
        /**
         * Register the default parameters.
         */
        private addDefaultParameters();
        /**
         * Register all TypeScript related properties.
         */
        private addCompilerParameters();
        /**
         * Add an input/source file.
         *
         * The input files will be used as source files for the compiler. All command line
         * arguments without parameter will be interpreted as being input files.
         *
         * @param fileName The path and filename of the input file.
         */
        addInputFile(fileName: string): void;
        /**
         * Retrieve a parameter by its name.
         *
         * @param name  The name of the parameter to look for.
         * @returns The parameter definition or NULL when not found.
         */
        getParameter(name: string): IParameter;
        /**
         * Return all parameters within the given scope.
         *
         * @param scope  The scope the parameter list should be filtered for.
         * @returns All parameters within the given scope
         */
        getParametersByScope(scope: ParameterScope): IParameter[];
        /**
         * Set the option described by the given parameter description to the given value.
         *
         * @param param  The parameter description of the option to set.
         * @param value  The target value of the option.
         * @returns TRUE on success, otherwise FALSE.
         */
        setOption(param: IParameter, value?: any): boolean;
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
        loadOptionFileFromArguments(args?: string[], ignoreUnknownArgs?: boolean): boolean;
        /**
         * Try to load an option file from a settings object.
         *
         * @param obj  The object whose properties should be applied.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        loadOptionFileFromObject(obj: any, ignoreUnknownArgs?: boolean): boolean;
        /**
         * Load the specified option file.
         *
         * @param optionFile  The absolute path and file name of the option file.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        loadOptionFile(optionFile: string, ignoreUnknownArgs?: boolean): boolean;
        /**
         * Apply the values of the given options object.
         *
         * @param obj  The object whose properties should be applied.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        parseObject(obj: any, ignoreUnknownArgs?: boolean): boolean;
        /**
         * Read and store the given list of arguments.
         *
         * @param args  The list of arguments that should be parsed. When omitted the
         *   current command line arguments will be used.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        parseArguments(args?: string[], ignoreUnknownArgs?: boolean): boolean;
        /**
         * Read the arguments stored in the given file.
         *
         * @param filename  The path and filename that should be parsed.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored?
         * @returns TRUE on success, otherwise FALSE.
         */
        parseResponseFile(filename: string, ignoreUnknownArgs?: boolean): boolean;
        /**
         * Prepare parameter information for the [[toString]] method.
         *
         * @param scope  The scope of the parameters whose help should be returned.
         * @returns The columns and lines for the help of the requested parameters.
         */
        private getParameterHelp(scope);
        /**
         * Print some usage information.
         *
         * Taken from TypeScript (src/compiler/tsc.ts)
         */
        toString(): string;
        /**
         * Convert the given value according to the type setting of the given parameter.
         *
         * @param param  The parameter definition.
         * @param value  The value that should be converted.
         * @returns The converted value.
         */
        static convert(param: IParameter, value?: any): any;
        /**
         * Create an options object populated with the default values.
         *
         * @returns An options object populated with default values.
         */
        static createOptions(): IOptions;
        /**
         * Create the compiler options populated with the default values.
         *
         * @returns A compiler options object populated with default values.
         */
        static createCompilerOptions(): ts.CompilerOptions;
    }
}
declare module td {
    interface IPluginInterface {
        remove(): any;
    }
    interface IPluginClass<T extends IPluginInterface> {
        new (instance: PluginHost<T>): T;
    }
    class PluginHost<T extends IPluginInterface> extends EventDispatcher implements IParameterProvider {
        /**
         * List of all plugins that are attached to this host.
         */
        plugins: {
            [name: string]: T;
        };
        static PLUGINS: {
            [name: string]: IPluginClass<IPluginInterface>;
        };
        getParameters(): IParameter[];
        /**
         * Retrieve a plugin instance.
         *
         * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
         */
        getPlugin(name: string): T;
        addPlugin(name: string, pluginClass: IPluginClass<T>): T;
        removePlugin(name: string): boolean;
        removeAllPlugins(): void;
        static registerPlugin<T extends IPluginInterface>(name: string, pluginClass: IPluginClass<T>): void;
        static loadPlugins<T extends IPluginInterface>(instance: PluginHost<T>): void;
    }
}
declare module td {
    /**
     * Normalize the given path.
     *
     * @param path  The path that should be normalized.
     * @returns The normalized path.
     */
    function normalizePath(path: string): string;
    /**
     * Test whether the given directory exists.
     *
     * @param directoryPath  The directory that should be tested.
     * @returns TRUE if the given directory exists, FALSE otherwise.
     */
    function directoryExists(directoryPath: string): boolean;
    /**
     * Make sure that the given directory exists.
     *
     * @param directoryPath  The directory that should be validated.
     */
    function ensureDirectoriesExist(directoryPath: string): void;
    /**
     * Write a file to disc.
     *
     * If the containing directory does not exist it will be created.
     *
     * @param fileName  The name of the file that should be written.
     * @param data  The contents of the file.
     * @param writeByteOrderMark  Whether the UTF-8 BOM should be written or not.
     * @param onError  A callback that will be invoked if an error occurs.
     */
    function writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
}
declare module td.converter {
    /**
     * Helper class that determines the common base path of a set of files.
     *
     * In the first step all files must be passed to [[add]]. Afterwards [[trim]]
     * can be used to retrieve the shortest path relative to the determined base path.
     */
    class BasePath {
        /**
         * List of known base paths.
         */
        private basePaths;
        /**
         * Add the given file path to this set of base paths.
         *
         * @param fileName  The absolute filename that should be added to the base path.
         */
        add(fileName: string): void;
        /**
         * Trim the given filename by the determined base paths.
         *
         * @param fileName  The absolute filename that should be trimmed.
         * @returns The trimmed version of the filename.
         */
        trim(fileName: string): string;
        /**
         * Reset this instance, ignore all paths already passed to [[add]].
         */
        reset(): void;
        /**
         * Normalize the given path.
         *
         * @param path  The path that should be normalized.
         * @returns Normalized version of the given path.
         */
        static normalize(path: string): string;
    }
}
declare module td.converter {
    /**
     * The context describes the current state the converter is in.
     */
    class Context {
        /**
         * The converter instance that has created the context.
         */
        converter: Converter;
        /**
         * A list of all files that have been passed to the TypeScript compiler.
         */
        fileNames: string[];
        /**
         * The TypeChecker instance returned by the TypeScript compiler.
         */
        checker: ts.TypeChecker;
        /**
         * The program that is currently processed.
         */
        program: ts.Program;
        /**
         * The project that is currently processed.
         */
        project: models.ProjectReflection;
        /**
         * The scope or parent reflection that is currently processed.
         */
        scope: models.Reflection;
        /**
         * Is the current source file marked as being external?
         */
        isExternal: boolean;
        /**
         * Is the current source file a declaration file?
         */
        isDeclaration: boolean;
        /**
         * The currently set type parameters.
         */
        typeParameters: ts.Map<models.Type>;
        /**
         * The currently set type arguments.
         */
        typeArguments: models.Type[];
        /**
         * Is the converter in inheritance mode?
         */
        isInherit: boolean;
        /**
         * The node that has started the inheritance mode.
         */
        inheritParent: ts.Node;
        /**
         * List symbol ids of inherited children already visited while inheriting.
         */
        inheritedChildren: number[];
        /**
         * The names of the children of the scope before inheritance has been started.
         */
        inherited: string[];
        /**
         * A list of parent nodes that have been passed to the visit function.
         */
        visitStack: ts.Node[];
        /**
         * Next free symbol id used by [[getSymbolID]].
         */
        private symbolID;
        /**
         * The pattern that should be used to flag external source files.
         */
        private externalPattern;
        /**
         * Create a new Context instance.
         *
         * @param converter  The converter instance that has created the context.
         * @param fileNames  A list of all files that have been passed to the TypeScript compiler.
         * @param checker  The TypeChecker instance returned by the TypeScript compiler.
         */
        constructor(converter: Converter, fileNames: string[], checker: ts.TypeChecker, program: ts.Program);
        /**
         * Return the current TypeDoc options object.
         */
        getOptions(): IOptions;
        /**
         * Return the compiler options.
         */
        getCompilerOptions(): ts.CompilerOptions;
        /**
         * Return the type declaration of the given node.
         *
         * @param node  The TypeScript node whose type should be resolved.
         * @returns The type declaration of the given node.
         */
        getTypeAtLocation(node: ts.Node): ts.Type;
        /**
         * Return the current logger instance.
         *
         * @returns The current logger instance.
         */
        getLogger(): Logger;
        /**
         * Return the symbol id of the given symbol.
         *
         * The compiler sometimes does not assign an id to symbols, this method makes sure that we have one.
         * It will assign negative ids if they are not set.
         *
         * @param symbol  The symbol whose id should be returned.
         * @returns The id of the given symbol.
         */
        getSymbolID(symbol: ts.Symbol): number;
        /**
         * Register a newly generated reflection.
         *
         * Ensures that the reflection is both listed in [[Project.reflections]] and
         * [[Project.symbolMapping]] if applicable.
         *
         * @param reflection  The reflection that should be registered.
         * @param node  The node the given reflection was resolved from.
         * @param symbol  The symbol the given reflection was resolved from.
         */
        registerReflection(reflection: models.Reflection, node: ts.Node, symbol?: ts.Symbol): void;
        /**
         * Trigger a node reflection event.
         *
         * All events are dispatched on the current converter instance.
         *
         * @param name  The name of the event that should be triggered.
         * @param reflection  The triggering reflection.
         * @param node  The triggering TypeScript node if available.
         */
        trigger(name: string, reflection: models.Reflection, node?: ts.Node): void;
        /**
         * Run the given callback with the context configured for the given source file.
         *
         * @param node  The TypeScript node containing the source file declaration.
         * @param callback  The callback that should be executed.
         */
        withSourceFile(node: ts.SourceFile, callback: Function): void;
        /**
         * @param callback  The callback function that should be executed with the changed context.
         */
        withScope(scope: models.Reflection, callback: Function): any;
        /**
         * @param parameters  An array of type parameters that should be set on the context while the callback is invoked.
         * @param callback  The callback function that should be executed with the changed context.
         */
        withScope(scope: models.Reflection, parameters: ts.NodeArray<ts.TypeParameterDeclaration>, callback: Function): any;
        /**
         * @param parameters  An array of type parameters that should be set on the context while the callback is invoked.
         * @param preserve  Should the currently set type parameters of the context be preserved?
         * @param callback  The callback function that should be executed with the changed context.
         */
        withScope(scope: models.Reflection, parameters: ts.NodeArray<ts.TypeParameterDeclaration>, preserve: boolean, callback: Function): any;
        /**
         * Inherit the children of the given TypeScript node to the current scope.
         *
         * @param baseNode  The node whose children should be inherited.
         * @param typeArguments  The type arguments that apply while inheriting the given node.
         * @return The resulting reflection / the current scope.
         */
        inherit(baseNode: ts.Node, typeArguments?: ts.NodeArray<ts.TypeNode>): models.Reflection;
        /**
         * Convert the given list of type parameter declarations into a type mapping.
         *
         * @param parameters  The list of type parameter declarations that should be converted.
         * @param preserve  Should the currently set type parameters of the context be preserved?
         * @returns The resulting type mapping.
         */
        private extractTypeParameters(parameters, preserve?);
    }
}
declare module td {
    interface IOptions {
        /**
         * The human readable name of the project. Used within the templates to set the title of the document.
         */
        name?: string;
        /**
         * Specifies the output mode the project is used to be compiled with.
         */
        mode?: SourceFileMode;
        /**
         * Define a pattern for files that should be considered being external.
         */
        externalPattern?: string;
        /**
         * Should declaration files be documented?
         */
        includeDeclarations?: boolean;
        /**
         * Should externally resolved TypeScript files be ignored?
         */
        excludeExternals?: boolean;
        /**
         * Should symbols that are not marked as being exported be ignored?
         */
        excludeNotExported?: boolean;
    }
}
declare module td.converter {
    /**
     * Result structure of the [[Converter.convert]] method.
     */
    interface IConverterResult {
        /**
         * An array containing all errors generated by the TypeScript compiler.
         */
        errors: ts.Diagnostic[];
        /**
         * The resulting project reflection.
         */
        project: models.ProjectReflection;
    }
    /**
     * Compiles source files using TypeScript and converts compiler symbols to reflections.
     */
    class Converter extends PluginHost<ConverterPlugin> implements ts.CompilerHost {
        /**
         * The host application of this converter instance.
         */
        application: IApplication;
        /**
         * The full path of the current directory. Result cache of [[getCurrentDirectory]].
         */
        private currentDirectory;
        /**
         * Return code of ts.sys.readFile when the file encoding is unsupported.
         */
        static ERROR_UNSUPPORTED_FILE_ENCODING: number;
        /**
         * General events
         */
        /**
         * Triggered when the converter begins converting a project.
         * The listener should implement [[IConverterCallback]].
         * @event
         */
        static EVENT_BEGIN: string;
        /**
         * Triggered when the converter has finished converting a project.
         * The listener should implement [[IConverterCallback]].
         * @event
         */
        static EVENT_END: string;
        /**
         * Factory events
         */
        /**
         * Triggered when the converter begins converting a source file.
         * The listener should implement [[IConverterNodeCallback]].
         * @event
         */
        static EVENT_FILE_BEGIN: string;
        /**
         * Triggered when the converter has created a declaration reflection.
         * The listener should implement [[IConverterNodeCallback]].
         * @event
         */
        static EVENT_CREATE_DECLARATION: string;
        /**
         * Triggered when the converter has created a signature reflection.
         * The listener should implement [[IConverterNodeCallback]].
         * @event
         */
        static EVENT_CREATE_SIGNATURE: string;
        /**
         * Triggered when the converter has created a parameter reflection.
         * The listener should implement [[IConverterNodeCallback]].
         * @event
         */
        static EVENT_CREATE_PARAMETER: string;
        /**
         * Triggered when the converter has created a type parameter reflection.
         * The listener should implement [[IConverterNodeCallback]].
         * @event
         */
        static EVENT_CREATE_TYPE_PARAMETER: string;
        /**
         * Triggered when the converter has found a function implementation.
         * The listener should implement [[IConverterNodeCallback]].
         * @event
         */
        static EVENT_FUNCTION_IMPLEMENTATION: string;
        /**
         * Resolve events
         */
        /**
         * Triggered when the converter begins resolving a project.
         * The listener should implement [[IConverterCallback]].
         * @event
         */
        static EVENT_RESOLVE_BEGIN: string;
        /**
         * Triggered when the converter resolves a reflection.
         * The listener should implement [[IConverterResolveCallback]].
         * @event
         */
        static EVENT_RESOLVE: string;
        /**
         * Triggered when the converter has finished resolving a project.
         * The listener should implement [[IConverterCallback]].
         * @event
         */
        static EVENT_RESOLVE_END: string;
        /**
         * Create a new Converter instance.
         *
         * @param application  The application instance this converter relies on. The application
         *   must expose the settings that should be used and serves as a global logging endpoint.
         */
        constructor(application: IApplication);
        /**
         * Return a list of parameters introduced by this component.
         *
         * @returns A list of parameter definitions introduced by this component.
         */
        getParameters(): IParameter[];
        /**
         * Compile the given source files and create a project reflection for them.
         *
         * @param fileNames  Array of the file names that should be compiled.
         */
        convert(fileNames: string[]): IConverterResult;
        /**
         * Compile the files within the given context and convert the compiler symbols to reflections.
         *
         * @param context  The context object describing the current state the converter is in.
         * @returns An array containing all errors generated by the TypeScript compiler.
         */
        private compile(context);
        /**
         * Resolve the project within the given context.
         *
         * @param context  The context object describing the current state the converter is in.
         * @returns The final project reflection.
         */
        private resolve(context);
        /**
         * Return the basename of the default library that should be used.
         *
         * @returns The basename of the default library.
         */
        getDefaultLib(): string;
        /**
         * CompilerHost implementation
         */
        /**
         * Return an instance of ts.SourceFile representing the given file.
         *
         * Implementation of ts.CompilerHost.getSourceFile()
         *
         * @param filename  The path and name of the file that should be loaded.
         * @param languageVersion  The script target the file should be interpreted with.
         * @param onError  A callback that will be invoked if an error occurs.
         * @returns An instance of ts.SourceFile representing the given file.
         */
        getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile;
        /**
         * Return the full path of the default library that should be used.
         *
         * Implementation of ts.CompilerHost.getDefaultLibFilename()
         *
         * @returns The full path of the default library.
         */
        getDefaultLibFileName(options: ts.CompilerOptions): string;
        /**
         * Return the full path of the current directory.
         *
         * Implementation of ts.CompilerHost.getCurrentDirectory()
         *
         * @returns The full path of the current directory.
         */
        getCurrentDirectory(): string;
        /**
         * Return whether file names are case sensitive on the current platform or not.
         *
         * Implementation of ts.CompilerHost.useCaseSensitiveFileNames()
         *
         * @returns TRUE if file names are case sensitive on the current platform, FALSE otherwise.
         */
        useCaseSensitiveFileNames(): boolean;
        /**
         * Check whether the given file exists.
         *
         * Implementation of ts.CompilerHost.fileExists(fileName)
         *
         * @param fileName
         * @returns {boolean}
         */
        fileExists(fileName: string): boolean;
        /**
         * Return the contents of the given file.
         *
         * Implementation of ts.CompilerHost.readFile(fileName)
         *
         * @param fileName
         * @returns {string}
         */
        readFile(fileName: string): string;
        /**
         * Return the canonical file name of the given file.
         *
         * Implementation of ts.CompilerHost.getCanonicalFileName()
         *
         * @param fileName  The file name whose canonical variant should be resolved.
         * @returns The canonical file name of the given file.
         */
        getCanonicalFileName(fileName: string): string;
        /**
         * Return the new line char sequence of the current platform.
         *
         * Implementation of ts.CompilerHost.getNewLine()
         *
         * @returns The new line char sequence of the current platform.
         */
        getNewLine(): string;
        /**
         * Write a compiled javascript file to disc.
         *
         * As TypeDoc will not emit compiled javascript files this is a null operation.
         *
         * Implementation of ts.CompilerHost.writeFile()
         *
         * @param fileName  The name of the file that should be written.
         * @param data  The contents of the file.
         * @param writeByteOrderMark  Whether the UTF-8 BOM should be written or not.
         * @param onError  A callback that will be invoked if an error occurs.
         */
        writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
    }
}
declare module td.converter {
    class ConverterPlugin implements IPluginInterface {
        /**
         * The converter this plugin is attached to.
         */
        protected converter: Converter;
        /**
         * Create a new CommentPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Removes this plugin.
         */
        remove(): void;
    }
}
declare module td.converter {
    function getDefaultValue(node: ts.VariableDeclaration): string;
    function getDefaultValue(node: ts.ParameterDeclaration): string;
    function getDefaultValue(node: ts.EnumMember): string;
    /**
     * Analyze the given node and create a suitable reflection.
     *
     * This function checks the kind of the node and delegates to the matching function implementation.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The compiler node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visit(context: Context, node: ts.Node): models.Reflection;
}
declare module td.converter {
    /**
     * Convert the given TypeScript type into its TypeDoc type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The node whose type should be reflected.
     * @param type  The type of the node if already known.
     * @returns The TypeDoc type reflection representing the given node and type.
     */
    function convertType(context: Context, node?: ts.Node, type?: ts.Type): models.Type;
    /**
     * Convert the given binding pattern to its type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The binding pattern that should be converted.
     * @returns The type reflection representing the given binding pattern.
     */
    function convertDestructuringType(context: Context, node: ts.BindingPattern): models.Type;
}
/**
 * Holds all data models used by TypeDoc.
 *
 * The [[BaseReflection]] is base class of all reflection models. The subclass [[ProjectReflection]]
 * serves as the root container for the current project while [[DeclarationReflection]] instances
 * form the structure of the project. Most of the other classes in this namespace are referenced by this
 * two base classes.
 *
 * The models [[NavigationItem]] and [[UrlMapping]] are special as they are only used by the [[Renderer]]
 * while creating the final output.
 */
declare module td.models {
    /**
     * Reset the reflection id.
     *
     * Used by the test cases to ensure the reflection ids won't change between runs.
     */
    function resetReflectionID(): void;
    /**
     * Defines the available reflection kinds.
     */
    enum ReflectionKind {
        Global = 0,
        ExternalModule = 1,
        Module = 2,
        Enum = 4,
        EnumMember = 16,
        Variable = 32,
        Function = 64,
        Class = 128,
        Interface = 256,
        Constructor = 512,
        Property = 1024,
        Method = 2048,
        CallSignature = 4096,
        IndexSignature = 8192,
        ConstructorSignature = 16384,
        Parameter = 32768,
        TypeLiteral = 65536,
        TypeParameter = 131072,
        Accessor = 262144,
        GetSignature = 524288,
        SetSignature = 1048576,
        ObjectLiteral = 2097152,
        TypeAlias = 4194304,
        Event = 8388608,
        ClassOrInterface = 384,
        VariableOrProperty = 1056,
        FunctionOrMethod = 2112,
        SomeSignature = 1601536,
        SomeModule = 3,
    }
    enum ReflectionFlag {
        Private = 1,
        Protected = 2,
        Public = 4,
        Static = 8,
        Exported = 16,
        ExportAssignment = 32,
        External = 64,
        Optional = 128,
        DefaultValue = 256,
        Rest = 512,
        ConstructorProperty = 1024,
    }
    interface IReflectionFlags extends Array<string> {
        flags?: ReflectionFlag;
        /**
         * Is this a private member?
         */
        isPrivate?: boolean;
        /**
         * Is this a protected member?
         */
        isProtected?: boolean;
        /**
         * Is this a public member?
         */
        isPublic?: boolean;
        /**
         * Is this a static member?
         */
        isStatic?: boolean;
        /**
         * Is this member exported?
         */
        isExported?: boolean;
        /**
         * Is this a declaration from an external document?
         */
        isExternal?: boolean;
        /**
         * Whether this reflection is an optional component or not.
         *
         * Applies to function parameters and object members.
         */
        isOptional?: boolean;
        /**
         * Whether it's a rest parameter, like `foo(...params);`.
         */
        isRest?: boolean;
        /**
         *
         */
        hasExportAssignment?: boolean;
        isConstructorProperty?: boolean;
    }
    interface IDefaultValueContainer extends Reflection {
        defaultValue: string;
    }
    interface ITypeContainer extends Reflection {
        type: Type;
    }
    interface ITypeParameterContainer extends Reflection {
        typeParameters: TypeParameterReflection[];
    }
    enum TraverseProperty {
        Children = 0,
        Parameters = 1,
        TypeLiteral = 2,
        TypeParameter = 3,
        Signatures = 4,
        IndexSignature = 5,
        GetSignature = 6,
        SetSignature = 7,
    }
    interface ITraverseCallback {
        (reflection: Reflection, property: TraverseProperty): void;
    }
    /**
     * Defines the usage of a decorator.
     */
    interface IDecorator {
        /**
         * The name of the decorator being applied.
         */
        name: string;
        /**
         * The type declaring the decorator.
         * Usually a ReferenceType instance pointing to the decorator function.
         */
        type?: Type;
        /**
         * A named map of arguments the decorator is applied with.
         */
        arguments?: any;
    }
    /**
     * Base class for all reflection classes.
     *
     * While generating a documentation, TypeDoc generates an instance of [[ProjectReflection]]
     * as the root for all reflections within the project. All other reflections are represented
     * by the [[DeclarationReflection]] class.
     *
     * This base class exposes the basic properties one may use to traverse the reflection tree.
     * You can use the [[children]] and [[parent]] properties to walk the tree. The [[groups]] property
     * contains a list of all children grouped and sorted for being rendered.
     */
    class Reflection {
        /**
         * Unique id of this reflection.
         */
        id: number;
        /**
         * The symbol name of this reflection.
         */
        name: string;
        /**
         * The original name of the TypeScript declaration.
         */
        originalName: string;
        /**
         * The kind of this reflection.
         */
        kind: ReflectionKind;
        /**
         * The human readable string representation of the kind of this reflection.
         */
        kindString: string;
        flags: IReflectionFlags;
        /**
         * The reflection this reflection is a child of.
         */
        parent: Reflection;
        /**
         * The parsed documentation comment attached to this reflection.
         */
        comment: Comment;
        /**
         * A list of all source files that contributed to this reflection.
         */
        sources: ISourceReference[];
        /**
         * A list of all decorators attached to this reflection.
         */
        decorators: IDecorator[];
        /**
         * A list of all types that are decorated by this reflection.
         */
        decorates: Type[];
        /**
         * The url of this reflection in the generated documentation.
         */
        url: string;
        /**
         * The name of the anchor of this child.
         */
        anchor: string;
        /**
         * Is the url pointing to an individual document?
         *
         * When FALSE, the url points to an anchor tag on a page of a different reflection.
         */
        hasOwnDocument: boolean;
        /**
         * A list of generated css classes that should be applied to representations of this
         * reflection in the generated markup.
         */
        cssClasses: string;
        /**
         * Url safe alias for this reflection.
         *
         * @see [[BaseReflection.getAlias]]
         */
        private _alias;
        private _aliases;
        /**
         * Create a new BaseReflection instance.
         */
        constructor(parent?: Reflection, name?: string, kind?: ReflectionKind);
        /**
         * @param kind  The kind to test for.
         */
        kindOf(kind: ReflectionKind): boolean;
        /**
         * @param kind  An array of kinds to test for.
         */
        kindOf(kind: ReflectionKind[]): boolean;
        /**
         * Return the full name of this reflection.
         *
         * The full name contains the name of this reflection and the names of all parent reflections.
         *
         * @param separator  Separator used to join the names of the reflections.
         * @returns The full name of this reflection.
         */
        getFullName(separator?: string): string;
        /**
         * Set a flag on this reflection.
         */
        setFlag(flag: ReflectionFlag, value?: boolean): void;
        /**
         * Return an url safe alias for this reflection.
         */
        getAlias(): string;
        /**
         * Has this reflection a visible comment?
         *
         * @returns TRUE when this reflection has a visible comment.
         */
        hasComment(): boolean;
        hasGetterOrSetter(): boolean;
        /**
         * @param name  The name of the child to look for. Might contain a hierarchy.
         */
        getChildByName(name: string): Reflection;
        /**
         * @param names  The name hierarchy of the child to look for.
         */
        getChildByName(names: string[]): Reflection;
        /**
         * @param name  The name to look for. Might contain a hierarchy.
         */
        findReflectionByName(name: string): Reflection;
        /**
         * @param names  The name hierarchy to look for.
         */
        findReflectionByName(names: string[]): Reflection;
        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback: ITraverseCallback): void;
        /**
         * Return a raw object representation of this reflection.
         */
        toObject(): any;
        /**
         * Return a string representation of this reflection.
         */
        toString(): string;
        /**
         * Return a string representation of this reflection and all of its children.
         *
         * @param indent  Used internally to indent child reflections.
         */
        toStringHierarchy(indent?: string): string;
    }
}
declare module td.converter {
    /**
     * Create a declaration reflection from the given TypeScript node.
     *
     * @param context  The context object describing the current state the converter is in. The
     *   scope of the context will be the parent of the generated reflection.
     * @param node  The TypeScript node that should be converted to a reflection.
     * @param kind  The desired kind of the reflection.
     * @param name  The desired name of the reflection.
     * @returns The resulting reflection.
     */
    function createDeclaration(context: Context, node: ts.Node, kind: models.ReflectionKind, name?: string): models.DeclarationReflection;
    /**
     * Create a new reference type pointing to the given symbol.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param symbol  The symbol the reference type should point to.
     * @param includeParent  Should the name of the parent be provided within the fallback name?
     * @returns A new reference type instance pointing to the given symbol.
     */
    function createReferenceType(context: Context, symbol: ts.Symbol, includeParent?: boolean): models.ReferenceType;
    /**
     * Create a new signature reflection from the given node.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The TypeScript node containing the signature declaration that should be reflected.
     * @param name  The name of the function or method this signature belongs to.
     * @param kind  The desired kind of the reflection.
     * @returns The newly created signature reflection describing the given node.
     */
    function createSignature(context: Context, node: ts.SignatureDeclaration, name: string, kind: models.ReflectionKind): models.SignatureReflection;
    /**
     * Create a type parameter reflection for the given node.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The type parameter node that should be reflected.
     * @returns The newly created type parameter reflection.
     */
    function createTypeParameter(context: Context, node: ts.TypeParameterDeclaration): models.TypeParameterType;
}
declare module td.converter {
    /**
     * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
     * the generated reflections.
     */
    class CommentPlugin extends ConverterPlugin {
        /**
         * List of discovered module comments.
         */
        private comments;
        /**
         * List of hidden reflections.
         */
        private hidden;
        /**
         * Create a new CommentPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        private storeModuleComment(comment, reflection);
        /**
         * Apply all comment tag modifiers to the given reflection.
         *
         * @param reflection  The reflection the modifiers should be applied to.
         * @param comment  The comment that should be searched for modifiers.
         */
        private applyModifiers(reflection, comment);
        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context);
        /**
         * Triggered when the converter has created a type parameter reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onCreateTypeParameter(context, reflection, node?);
        /**
         * Triggered when the converter has created a declaration or signature reflection.
         *
         * Invokes the comment parser.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context, reflection, node?);
        /**
         * Triggered when the converter has found a function implementation.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onFunctionImplementation(context, reflection, node?);
        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context);
        /**
         * Triggered when the converter resolves a reflection.
         *
         * Cleans up comment tags related to signatures like @param or @return
         * and moves their data to the corresponding parameter reflections.
         *
         * This hook also copies over the comment of function implementations to their
         * signatures.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context, reflection);
        /**
         * Return the raw comment string for the given node.
         *
         * @param node  The node whose comment should be resolved.
         * @returns     The raw comment string or NULL if no comment could be found.
         */
        static getComment(node: ts.Node): string;
        /**
         * Remove all tags with the given name from the given comment instance.
         *
         * @param comment  The comment that should be modified.
         * @param tagName  The name of the that that should be removed.
         */
        static removeTags(comment: models.Comment, tagName: string): void;
        /**
         * Remove the given reflection from the project.
         */
        static removeReflection(project: models.ProjectReflection, reflection: models.Reflection): void;
        /**
         * Parse the given doc comment string.
         *
         * @param text     The doc comment string that should be parsed.
         * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
         * @returns        A populated [[Models.Comment]] instance.
         */
        static parseComment(text: string, comment?: models.Comment): models.Comment;
    }
}
declare module td.converter {
    /**
     * A plugin that detects decorators.
     */
    class DecoratorPlugin extends ConverterPlugin {
        private usages;
        /**
         * Create a new ImplementsPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Create an object describing the arguments a decorator is set with.
         *
         * @param args  The arguments resolved from the decorator's call expression.
         * @param signature  The signature definition of the decorator being used.
         * @returns An object describing the decorator parameters,
         */
        private extractArguments(args, signature);
        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context);
        /**
         * Triggered when the converter has created a declaration or signature reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context, reflection, node?);
        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onBeginResolve(context);
    }
}
declare module td.converter {
    /**
     * A handler that moves comments with dot syntax to their target.
     */
    class DeepCommentPlugin extends ConverterPlugin {
        /**
         * Create a new CommentHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context);
    }
}
declare module td.converter {
    /**
     * A handler that truncates the names of dynamic modules to not include the
     * project's base path.
     */
    class DynamicModulePlugin extends ConverterPlugin {
        /**
         * Helper class for determining the base path.
         */
        private basePath;
        /**
         * List of reflections whose name must be trimmed.
         */
        private reflections;
        /**
         * Create a new DynamicModuleHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context);
        /**
         * Triggered when the converter has created a declaration reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context, reflection, node?);
        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context);
    }
}
declare module td.converter {
    /**
     * A handler that watches for repositories with GitHub origin and links
     * their source files to the related GitHub pages.
     */
    class GitHubPlugin extends ConverterPlugin {
        /**
         * List of known repositories.
         */
        private repositories;
        /**
         * List of paths known to be not under git control.
         */
        private ignoredPaths;
        /**
         * Create a new GitHubHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Check whether the given file is placed inside a repository.
         *
         * @param fileName  The name of the file a repository should be looked for.
         * @returns The found repository info or NULL.
         */
        private getRepository(fileName);
        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onEndResolve(context);
    }
}
declare module td.converter {
    /**
     * A handler that sorts and groups the found reflections in the resolving phase.
     *
     * The handler sets the ´groups´ property of all reflections.
     */
    class GroupPlugin extends ConverterPlugin {
        /**
         * Define the sort order of reflections.
         */
        static WEIGHTS: models.ReflectionKind[];
        /**
         * Define the singular name of individual reflection kinds.
         */
        static SINGULARS: {};
        /**
         * Define the plural name of individual reflection kinds.
         */
        static PLURALS: {};
        /**
         * Create a new GroupPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context, reflection);
        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onEndResolve(context);
        /**
         * Create a grouped representation of the given list of reflections.
         *
         * Reflections are grouped by kind and sorted by weight and name.
         *
         * @param reflections  The reflections that should be grouped.
         * @returns An array containing all children of the given reflection grouped by their kind.
         */
        static getReflectionGroups(reflections: models.DeclarationReflection[]): models.ReflectionGroup[];
        /**
         * Transform the internal typescript kind identifier into a human readable version.
         *
         * @param kind  The original typescript kind identifier.
         * @returns A human readable version of the given typescript kind identifier.
         */
        private static getKindString(kind);
        /**
         * Return the singular name of a internal typescript kind identifier.
         *
         * @param kind The original internal typescript kind identifier.
         * @returns The singular name of the given internal typescript kind identifier
         */
        static getKindSingular(kind: models.ReflectionKind): string;
        /**
         * Return the plural name of a internal typescript kind identifier.
         *
         * @param kind The original internal typescript kind identifier.
         * @returns The plural name of the given internal typescript kind identifier
         */
        static getKindPlural(kind: models.ReflectionKind): string;
        /**
         * Callback used to sort reflections by weight defined by ´GroupPlugin.WEIGHTS´ and name.
         *
         * @param a The left reflection to sort.
         * @param b The right reflection to sort.
         * @returns The sorting weight.
         */
        static sortCallback(a: models.Reflection, b: models.Reflection): number;
    }
}
declare module td.converter {
    /**
     * A plugin that detects interface implementations of functions and
     * properties on classes and links them.
     */
    class ImplementsPlugin extends ConverterPlugin {
        /**
         * Create a new ImplementsPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Mark all members of the given class to be the implementation of the matching interface member.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param classReflection  The reflection of the classReflection class.
         * @param interfaceReflection  The reflection of the interfaceReflection interface.
         */
        private analyzeClass(context, classReflection, interfaceReflection);
        /**
         * Copy the comment of the source reflection to the target reflection.
         *
         * @param target
         * @param source
         */
        private copyComment(target, source);
        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context, reflection);
    }
}
declare module td {
    interface IOptions {
        /**
         * The location of the readme file that should be displayed on the index page. Set this to 'none' to
         * remove the index page and start with the globals page.
         */
        readme?: string;
    }
}
declare module td.converter {
    /**
     * A handler that tries to find the package.json and readme.md files of the
     * current project.
     *
     * The handler traverses the file tree upwards for each file processed by the processor
     * and records the nearest package info files it can find. Within the resolve files, the
     * contents of the found files will be read and appended to the ProjectReflection.
     */
    class PackagePlugin extends ConverterPlugin implements IParameterProvider {
        /**
         * The file name of the found readme.md file.
         */
        private readmeFile;
        /**
         * The file name of the found package.json file.
         */
        private packageFile;
        /**
         * List of directories the handler already inspected.
         */
        private visited;
        /**
         * Should the readme file be ignored?
         */
        private noReadmeFile;
        /**
         * Create a new PackageHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        getParameters(): IParameter[];
        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context);
        /**
         * Triggered when the converter begins converting a source file.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onBeginDocument(context, reflection, node?);
        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context);
    }
}
declare module td.converter {
    /**
     * A handler that attaches source file information to reflections.
     */
    class SourcePlugin extends ConverterPlugin {
        /**
         * Helper for resolving the base path of all source files.
         */
        private basePath;
        /**
         * A map of all generated [[SourceFile]] instances.
         */
        private fileMappings;
        /**
         * Create a new SourceHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        private getSourceFile(fileName, project);
        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin();
        /**
         * Triggered when the converter begins converting a source file.
         *
         * Create a new [[SourceFile]] instance for all TypeScript files.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onBeginDocument(context, reflection, node?);
        /**
         * Triggered when the converter has created a declaration reflection.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context, reflection, node?);
        /**
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context);
        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context, reflection);
        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onEndResolve(context);
    }
}
declare module td.converter {
    /**
     * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
     */
    class TypePlugin extends ConverterPlugin {
        reflections: models.DeclarationReflection[];
        /**
         * Create a new TypeHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context, reflection);
        private postpone(reflection);
        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onResolveEnd(context);
    }
}
declare module td.models {
    /**
     * A model that represents a javadoc comment.
     *
     * Instances of this model are created by the [[CommentHandler]]. You can retrieve comments
     * through the [[BaseReflection.comment]] property.
     */
    class Comment {
        /**
         * The abstract of the comment. TypeDoc interprets the first paragraph of a comment
         * as the abstract.
         */
        shortText: string;
        /**
         * The full body text of the comment. Excludes the [[shortText]].
         */
        text: string;
        /**
         * The text of the ```@returns``` tag if present.
         */
        returns: string;
        /**
         * All associated javadoc tags.
         */
        tags: CommentTag[];
        /**
         * Creates a new Comment instance.
         */
        constructor(shortText?: string, text?: string);
        /**
         * Has this comment a visible component?
         *
         * @returns TRUE when this comment has a visible component.
         */
        hasVisibleComponent(): boolean;
        /**
         * Test whether this comment contains a tag with the given name.
         *
         * @param tagName  The name of the tag to look for.
         * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
         */
        hasTag(tagName: string): boolean;
        /**
         * Return the first tag with the given name.
         *
         * You can optionally pass a parameter name that should be searched to.
         *
         * @param tagName  The name of the tag to look for.
         * @param paramName  An optional parameter name to look for.
         * @returns The found tag or NULL.
         */
        getTag(tagName: string, paramName?: string): CommentTag;
        /**
         * Copy the data of the given comment into this comment.
         *
         * @param comment
         */
        copyFrom(comment: Comment): void;
        /**
         * Return a raw object representation of this comment.
         */
        toObject(): any;
    }
}
declare module td.models {
    /**
     * A model that represents a single javadoc comment tag.
     *
     * Tags are stored in the [[Comment.tags]] property.
     */
    class CommentTag {
        /**
         * The name of this tag.
         */
        tagName: string;
        /**
         * The name of the related parameter when this is a ```@param``` tag.
         */
        paramName: string;
        /**
         * The actual body text of this tag.
         */
        text: string;
        /**
         * Create a new CommentTag instance.
         */
        constructor(tagName: string, paramName?: string, text?: string);
        /**
         * Return a raw object representation of this tag.
         */
        toObject(): any;
    }
}
declare module td.models {
    /**
     * A group of reflections. All reflections in a group are of the same kind.
     *
     * Reflection groups are created by the ´GroupHandler´ in the resolving phase
     * of the dispatcher. The main purpose of groups is to be able to more easily
     * render human readable children lists in templates.
     */
    class ReflectionGroup {
        /**
         * The title, a string representation of the typescript kind, of this group.
         */
        title: string;
        /**
         * The original typescript kind of the children of this group.
         */
        kind: ReflectionKind;
        /**
         * All reflections of this group.
         */
        children: DeclarationReflection[];
        /**
         * A list of generated css classes that should be applied to representations of this
         * group in the generated markup.
         */
        cssClasses: string;
        /**
         * Do all children of this group have a separate document?
         *
         * A bound representation of the ´ReflectionGroup.getAllChildrenHaveOwnDocument´
         * that can be used within templates.
         */
        allChildrenHaveOwnDocument: Function;
        /**
         * Are all children inherited members?
         */
        allChildrenAreInherited: boolean;
        /**
         * Are all children private members?
         */
        allChildrenArePrivate: boolean;
        /**
         * Are all children private or protected members?
         */
        allChildrenAreProtectedOrPrivate: boolean;
        /**
         * Are all children external members?
         */
        allChildrenAreExternal: boolean;
        /**
         * Are any children exported declarations?
         */
        someChildrenAreExported: boolean;
        /**
         * Create a new ReflectionGroup instance.
         *
         * @param title The title of this group.
         * @param kind  The original typescript kind of the children of this group.
         */
        constructor(title: string, kind: ReflectionKind);
        /**
         * Do all children of this group have a separate document?
         */
        private getAllChildrenHaveOwnDocument();
        /**
         * Return a raw object representation of this reflection group.
         */
        toObject(): any;
    }
}
declare module td.models {
    /**
     * Exposes information about a directory containing source files.
     *
     * One my access the root directory of a project through the [[ProjectReflection.directory]]
     * property. Traverse through directories by utilizing the [[SourceDirectory.parent]] or
     * [[SourceDirectory.directories]] properties.
     */
    class SourceDirectory {
        /**
         * The parent directory or NULL if this is a root directory.
         */
        parent: SourceDirectory;
        /**
         * A list of all subdirectories.
         */
        directories: {
            [name: string]: SourceDirectory;
        };
        /**
         * A list of all files in this directory.
         */
        files: SourceFile[];
        /**
         * The name of this directory.
         */
        name: string;
        /**
         * The relative path from the root directory to this directory.
         */
        dirName: string;
        /**
         * The url of the page displaying the directory contents.
         */
        url: string;
        /**
         * Create a new SourceDirectory instance.
         *
         * @param name  The new of directory.
         * @param parent  The parent directory instance.
         */
        constructor(name?: string, parent?: SourceDirectory);
        /**
         * Return a string describing this directory and its contents.
         *
         * @param indent  Used internally for indention.
         * @returns A string representing this directory and all of its children.
         */
        toString(indent?: string): string;
        /**
         * Return a list of all reflections exposed by the files within this directory.
         *
         * @returns An aggregated list of all [[DeclarationReflection]] defined in the
         * files of this directory.
         */
        getAllReflections(): DeclarationReflection[];
    }
}
declare module td.models {
    /**
     * Exposes information about a source file.
     *
     * One my access a list of all source files through the [[ProjectReflection.files]] property or as
     * a tree structure through the [[ProjectReflection.directory]] property.
     *
     * Furthermore each reflection carries references to the related SourceFile with their
     * [[DeclarationReflection.sources]] property. It is an array of of [[IDeclarationSource]] instances
     * containing the reference in their [[IDeclarationSource.file]] field.
     */
    class SourceFile {
        /**
         * The original full system file name.
         */
        fullFileName: string;
        /**
         * A trimmed version of the file name. Contains only the path relative to the
         * determined base path.
         */
        fileName: string;
        /**
         * The base name of the file.
         */
        name: string;
        /**
         * A url pointing to a page displaying the contents of this file.
         */
        url: string;
        /**
         * The representation of the parent directory of this source file.
         */
        parent: SourceDirectory;
        /**
         * A list of all reflections that are declared in this file.
         */
        reflections: DeclarationReflection[];
        /**
         * A grouped list of the reflections declared in this file.
         */
        groups: ReflectionGroup[];
        /**
         * Create a new SourceFile instance.
         *
         * @param fullFileName  The full file name.
         */
        constructor(fullFileName: string);
    }
}
declare module td.models {
    /**
     * Base class of all type definitions.
     *
     * Instances of this class are also used to represent the type `void`.
     */
    class Type {
        /**
         * Is this an array type?
         */
        isArray: boolean;
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: Type): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
        /**
         * Test whether the two given list of types contain equal types.
         *
         * @param a
         * @param b
         */
        static isTypeListSimiliar(a: Type[], b: Type[]): boolean;
        /**
         * Test whether the two given list of types are equal.
         *
         * @param a
         * @param b
         */
        static isTypeListEqual(a: Type[], b: Type[]): boolean;
    }
}
declare module td.models {
    class ContainerReflection extends Reflection {
        /**
         * The children of this reflection.
         */
        children: DeclarationReflection[];
        /**
         * All children grouped by their kind.
         */
        groups: ReflectionGroup[];
        /**
         * Return a list of all children of a certain kind.
         *
         * @param kind  The desired kind of children.
         * @returns     An array containing all children with the desired kind.
         */
        getChildrenByKind(kind: ReflectionKind): DeclarationReflection[];
        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback: ITraverseCallback): void;
        /**
         * Return a raw object representation of this reflection.
         */
        toObject(): any;
    }
}
declare module td.models {
    /**
     * Stores hierarchical type data.
     *
     * @see [[DeclarationReflection.typeHierarchy]]
     */
    interface IDeclarationHierarchy {
        /**
         * The types represented by this node in the hierarchy.
         */
        types: Type[];
        /**
         * The next hierarchy level.
         */
        next?: IDeclarationHierarchy;
        /**
         * Is this the entry containing the target type?
         */
        isTarget?: boolean;
    }
    /**
     * Represents references of reflections to their defining source files.
     *
     * @see [[DeclarationReflection.sources]]
     */
    interface ISourceReference {
        /**
         * A reference to the corresponding file instance.
         */
        file?: SourceFile;
        /**
         * The filename of the source file.
         */
        fileName: string;
        /**
         * The number of the line that emitted the declaration.
         */
        line: number;
        character: number;
        /**
         * URL for displaying the source file.
         */
        url?: string;
    }
    /**
     * A reflection that represents a single declaration emitted by the TypeScript compiler.
     *
     * All parts of a project are represented by DeclarationReflection instances. The actual
     * kind of a reflection is stored in its ´kind´ member.
     */
    class DeclarationReflection extends ContainerReflection implements IDefaultValueContainer, ITypeContainer, ITypeParameterContainer {
        /**
         * The type of the reflection.
         *
         * If the reflection represents a variable or a property, this is the value type.<br />
         * If the reflection represents a signature, this is the return type.
         */
        type: Type;
        typeParameters: TypeParameterReflection[];
        /**
         * A list of call signatures attached to this declaration.
         *
         * TypeDoc creates one declaration per function that may contain ore or more
         * signature reflections.
         */
        signatures: SignatureReflection[];
        /**
         * The index signature of this declaration.
         */
        indexSignature: SignatureReflection;
        /**
         * The get signature of this declaration.
         */
        getSignature: SignatureReflection;
        /**
         * The set signature of this declaration.
         */
        setSignature: SignatureReflection;
        /**
         * The default value of this reflection.
         *
         * Applies to function parameters.
         */
        defaultValue: string;
        /**
         * A type that points to the reflection that has been overwritten by this reflection.
         *
         * Applies to interface and class members.
         */
        overwrites: Type;
        /**
         * A type that points to the reflection this reflection has been inherited from.
         *
         * Applies to interface and class members.
         */
        inheritedFrom: Type;
        /**
         * A type that points to the reflection this reflection is the implementation of.
         *
         * Applies to class members.
         */
        implementationOf: Type;
        /**
         * A list of all types this reflection extends (e.g. the parent classes).
         */
        extendedTypes: Type[];
        /**
         * A list of all types that extend this reflection (e.g. the subclasses).
         */
        extendedBy: Type[];
        /**
         * A list of all types this reflection implements.
         */
        implementedTypes: Type[];
        /**
         * A list of all types that implement this reflection.
         */
        implementedBy: Type[];
        /**
         * Contains a simplified representation of the type hierarchy suitable for being
         * rendered in templates.
         */
        typeHierarchy: IDeclarationHierarchy;
        hasGetterOrSetter(): boolean;
        getAllSignatures(): SignatureReflection[];
        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback: ITraverseCallback): void;
        /**
         * Return a raw object representation of this reflection.
         */
        toObject(): any;
        /**
         * Return a string representation of this reflection.
         */
        toString(): string;
    }
}
declare module td.models {
    class ParameterReflection extends Reflection implements IDefaultValueContainer, ITypeContainer {
        parent: SignatureReflection;
        defaultValue: string;
        type: Type;
        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback: ITraverseCallback): void;
        /**
         * Return a raw object representation of this reflection.
         */
        toObject(): any;
        /**
         * Return a string representation of this reflection.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * A reflection that represents the root of the project.
     *
     * The project reflection acts as a global index, one may receive all reflections
     * and source files of the processed project through this reflection.
     */
    class ProjectReflection extends ContainerReflection {
        /**
         * A list of all reflections within the project.
         */
        reflections: {
            [id: number]: Reflection;
        };
        symbolMapping: {
            [symbolId: number]: number;
        };
        /**
         * The root directory of the project.
         */
        directory: SourceDirectory;
        /**
         * A list of all source files within the project.
         */
        files: SourceFile[];
        /**
         * The name of the project.
         *
         * The name can be passed as a commandline argument or it is read from the package info.
         */
        name: string;
        /**
         * The contents of the readme.md file of the project when found.
         */
        readme: string;
        /**
         * The parsed data of the package.json file of the project when found.
         */
        packageInfo: any;
        /**
         * Create a new ProjectReflection instance.
         *
         * @param name  The name of the project.
         */
        constructor(name: string);
        /**
         * Return a list of all reflections in this project of a certain kind.
         *
         * @param kind  The desired kind of reflection.
         * @returns     An array containing all reflections with the desired kind.
         */
        getReflectionsByKind(kind: ReflectionKind): DeclarationReflection[];
        /**
         * @param name  The name to look for. Might contain a hierarchy.
         */
        findReflectionByName(name: string): Reflection;
        /**
         * @param names  The name hierarchy to look for.
         */
        findReflectionByName(names: string[]): Reflection;
    }
}
declare module td.models {
    class SignatureReflection extends Reflection implements ITypeContainer, ITypeParameterContainer {
        parent: ContainerReflection;
        parameters: ParameterReflection[];
        typeParameters: TypeParameterReflection[];
        type: Type;
        /**
         * A type that points to the reflection that has been overwritten by this reflection.
         *
         * Applies to interface and class members.
         */
        overwrites: Type;
        /**
         * A type that points to the reflection this reflection has been inherited from.
         *
         * Applies to interface and class members.
         */
        inheritedFrom: Type;
        /**
         * A type that points to the reflection this reflection is the implementation of.
         *
         * Applies to class members.
         */
        implementationOf: Type;
        /**
         * Return an array of the parameter types.
         */
        getParameterTypes(): Type[];
        /**
         * Traverse all potential child reflections of this reflection.
         *
         * The given callback will be invoked for all children, signatures and type parameters
         * attached to this reflection.
         *
         * @param callback  The callback function that should be applied for each child reflection.
         */
        traverse(callback: ITraverseCallback): void;
        /**
         * Return a raw object representation of this reflection.
         */
        toObject(): any;
        /**
         * Return a string representation of this reflection.
         */
        toString(): string;
    }
}
declare module td.models {
    class TypeParameterReflection extends Reflection implements ITypeContainer {
        parent: DeclarationReflection;
        type: Type;
        /**
         * Create a new TypeParameterReflection instance.
         */
        constructor(parent?: Reflection, type?: TypeParameterType);
        /**
         * Return a raw object representation of this reflection.
         */
        toObject(): any;
    }
}
declare module td.models {
    /**
     * Represents an intrinsic type like `string` or `boolean`.
     *
     * ~~~
     * var value:number;
     * ~~~
     */
    class IntrinsicType extends Type {
        /**
         * The name of the intrinsic type like `string` or `boolean`.
         */
        name: string;
        /**
         * Create a new instance of IntrinsicType.
         *
         * @param name  The name of the intrinsic type like `string` or `boolean`.
         */
        constructor(name: string);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: IntrinsicType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents a type that refers to another reflection like a class, interface or enum.
     *
     * ~~~
     * var value:MyClass;
     * ~~~
     */
    class ReferenceType extends Type {
        /**
         * The name of the referenced type.
         *
         * If the symbol cannot be found cause it's not part of the documentation this
         * can be used to represent the type.
         */
        name: string;
        /**
         * The type arguments of this reference.
         */
        typeArguments: Type[];
        /**
         * The symbol id of the referenced type as returned from the TypeScript compiler.
         *
         * After the all reflections have been generated this is can be used to lookup the
         * relevant reflection with [[ProjectReflection.symbolMapping]].
         */
        symbolID: number;
        /**
         * The resolved reflection.
         *
         * The [[TypePlugin]] will try to set this property in the resolving phase.
         */
        reflection: Reflection;
        /**
         * Special symbol ID noting that the reference of a ReferenceType was known when creating the type.
         */
        static SYMBOL_ID_RESOLVED: number;
        /**
         * Special symbol ID noting that the reference should be resolved by the type name.
         */
        static SYMBOL_ID_RESOLVE_BY_NAME: number;
        /**
         * Create a new instance of ReferenceType.
         *
         * @param name        The name of the referenced type.
         * @param symbolID    The symbol id of the referenced type as returned from the TypeScript compiler.
         * @param reflection  The resolved reflection if already known.
         */
        constructor(name: string, symbolID: number, reflection?: Reflection);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: ReferenceType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents a type which has it's own reflection like literal types.
     *
     * ~~~
     * var value:{subValueA;subValueB;subValueC;};
     * ~~~
     */
    class ReflectionType extends Type {
        /**
         * The reflection of the type.
         */
        declaration: DeclarationReflection;
        /**
         * Create a new instance of ReflectionType.
         *
         * @param declaration  The reflection of the type.
         */
        constructor(declaration: DeclarationReflection);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: ReflectionType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents a string literal type.
     *
     * ~~~
     * var value:"DIV";
     * ~~~
     */
    class StringLiteralType extends Type {
        /**
         * The string literal value.
         */
        value: string;
        /**
         * Create a new instance of StringLiteralType.
         *
         * @param value The string literal value.
         */
        constructor(value: string);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: StringLiteralType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents a tuple type.
     *
     * ~~~
     * var value:[string,boolean];
     * ~~~
     */
    class TupleType extends Type {
        /**
         * The ordered type elements of the tuple type.
         */
        elements: Type[];
        /**
         * Create a new TupleType instance.
         *
         * @param elements  The ordered type elements of the tuple type.
         */
        constructor(elements: Type[]);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: TupleType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents a type parameter type.
     *
     * ~~~
     * var value:T;
     * ~~~
     */
    class TypeParameterType extends Type {
        /**
         *
         */
        name: string;
        constraint: Type;
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: TypeParameterType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents an union type.
     *
     * ~~~
     * var value:string | string[];
     * ~~~
     */
    class UnionType extends Type {
        /**
         * The types this union consists of.
         */
        types: Type[];
        /**
         * Create a new TupleType instance.
         *
         * @param types  The types this union consists of.
         */
        constructor(types: Type[]);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: UnionType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
declare module td.models {
    /**
     * Represents all unknown types.
     */
    class UnknownType extends Type {
        /**
         * A string representation of the type as returned from TypeScript compiler.
         */
        name: string;
        /**
         * Create a new instance of UnknownType.
         *
         * @param name  A string representation of the type as returned from TypeScript compiler.
         */
        constructor(name: string);
        /**
         * Clone this type.
         *
         * @return A clone of this type.
         */
        clone(): Type;
        /**
         * Test whether this type equals the given type.
         *
         * @param type  The type that should be checked for equality.
         * @returns TRUE if the given type equals this type, FALSE otherwise.
         */
        equals(type: UnknownType): boolean;
        /**
         * Return a raw object representation of this type.
         */
        toObject(): any;
        /**
         * Return a string representation of this type.
         */
        toString(): string;
    }
}
/**
 * Holds all logic used render and output the final documentation.
 *
 * The [[Renderer]] class is the central controller within this namespace. When invoked it creates
 * an instance of [[BaseTheme]] which defines the layout of the documentation and fires a
 * series of [[OutputEvent]] events. Instances of [[BasePlugin]] can listen to these events and
 * alter the generated output.
 */
declare module td.output {
    /**
     * Interface representation of a handlebars template.
     */
    interface IHandlebarTemplate {
        (context?: any, options?: any): string;
    }
    /**
     * The renderer processes a [[ProjectReflection]] using a [[BaseTheme]] instance and writes
     * the emitted html documents to a output directory. You can specify which theme should be used
     * using the ```--theme <name>``` commandline argument.
     *
     * Subclasses of [[BasePlugin]] that have registered themselves in the [[Renderer.PLUGIN_CLASSES]]
     * will be automatically initialized. Most of the core functionality is provided as separate plugins.
     *
     * [[Renderer]] is a subclass of [[EventDispatcher]] and triggers a series of events while
     * a project is being processed. You can listen to these events to control the flow or manipulate
     * the output.
     *
     *  * [[Renderer.EVENT_BEGIN]]<br>
     *    Triggered before the renderer starts rendering a project. The listener receives
     *    an instance of [[OutputEvent]]. By calling [[OutputEvent.preventDefault]] the entire
     *    render process can be canceled.
     *
     *    * [[Renderer.EVENT_BEGIN_PAGE]]<br>
     *      Triggered before a document will be rendered. The listener receives an instance of
     *      [[OutputPageEvent]]. By calling [[OutputPageEvent.preventDefault]] the generation of the
     *      document can be canceled.
     *
     *    * [[Renderer.EVENT_END_PAGE]]<br>
     *      Triggered after a document has been rendered, just before it is written to disc. The
     *      listener receives an instance of [[OutputPageEvent]]. When calling
     *      [[OutputPageEvent.preventDefault]] the the document will not be saved to disc.
     *
     *  * [[Renderer.EVENT_END]]<br>
     *    Triggered after the renderer has written all documents. The listener receives
     *    an instance of [[OutputEvent]].
     */
    class Renderer extends PluginHost<RendererPlugin> {
        /**
         * The application this dispatcher is attached to.
         */
        application: IApplication;
        /**
         * The theme that is used to render the documentation.
         */
        theme: Theme;
        /**
         * Hash map of all loaded templates indexed by filename.
         */
        private templates;
        /**
         * Triggered before the renderer starts rendering a project.
         * @event
         */
        static EVENT_BEGIN: string;
        /**
         * Triggered after the renderer has written all documents.
         * @event
         */
        static EVENT_END: string;
        /**
         * Triggered before a document will be rendered.
         * @event
         */
        static EVENT_BEGIN_PAGE: string;
        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         * @event
         */
        static EVENT_END_PAGE: string;
        /**
         * Create a new Renderer instance.
         *
         * @param application  The application this dispatcher is attached to.
         */
        constructor(application: IApplication);
        getParameters(): IParameter[];
        /**
         * Return the template with the given filename.
         *
         * Tries to find the file in the ´templates´ subdirectory of the current theme.
         * If it does not exist, TypeDoc tries to find the template in the default
         * theme templates subdirectory.
         *
         * @param fileName  The filename of the template that should be loaded.
         * @returns The compiled template or NULL if the file could not be found.
         */
        getTemplate(fileName: string): IHandlebarTemplate;
        /**
         * Render the given project reflection to the specified output directory.
         *
         * @param project  The project that should be rendered.
         * @param outputDirectory  The path of the directory the documentation should be rendered to.
         */
        render(project: models.ProjectReflection, outputDirectory: string): void;
        /**
         * Render a single page.
         *
         * @param page An event describing the current page.
         * @return TRUE if the page has been saved to disc, otherwise FALSE.
         */
        private renderDocument(page);
        /**
         * Ensure that a theme has been setup.
         *
         * If a the user has set a theme we try to find and load it. If no theme has
         * been specified we load the default theme.
         *
         * @returns TRUE if a theme has been setup, otherwise FALSE.
         */
        private prepareTheme();
        /**
         * Prepare the output directory. If the directory does not exist, it will be
         * created. If the directory exists, it will be emptied.
         *
         * @param directory  The path to the directory that should be prepared.
         * @returns TRUE if the directory could be prepared, otherwise FALSE.
         */
        private prepareOutputDirectory(directory);
        /**
         * Return the path containing the themes shipped with TypeDoc.
         *
         * @returns The path to the theme directory.
         */
        static getThemeDirectory(): string;
        /**
         * Return the path to the default theme.
         *
         * @returns The path to the default theme.
         */
        static getDefaultTheme(): string;
        /**
         * Load the given file and return its contents.
         *
         * @param file  The path of the file to read.
         * @returns The files contents.
         */
        static readFile(file: any): string;
    }
}
declare module td.output {
    /**
     * Base class of all plugins that can be attached to the [[Renderer]].
     */
    class RendererPlugin {
        /**
         * The renderer this plugin is attached to.
         */
        protected renderer: Renderer;
        /**
         * Create a new RendererPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Remove this plugin from the renderer.
         */
        remove(): void;
    }
    /**
     * A plugin for the renderer that reads the current render context.
     */
    class ContextAwareRendererPlugin extends RendererPlugin {
        /**
         * The project that is currently processed.
         */
        protected project: models.ProjectReflection;
        /**
         * The reflection that is currently processed.
         */
        protected reflection: models.DeclarationReflection;
        /**
         * The url of the document that is being currently generated.
         */
        private location;
        /**
         * Create a new ContextAwareRendererPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Transform the given absolute path into a relative path.
         *
         * @param absolute  The absolute path to transform.
         * @returns A path relative to the document currently processed.
         */
        getRelativeUrl(absolute: string): string;
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        protected onRendererBegin(event: OutputEvent): void;
        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        protected onRendererBeginPage(page: OutputPageEvent): void;
    }
}
declare module td.output {
    /**
     * Base class of all themes.
     *
     * A theme defines the logical and graphical output of a documentation. Themes are
     * directories containing a ```theme.js``` file defining a [[BaseTheme]] subclass and a
     * series of subdirectories containing templates and assets. You can select a theme
     * through the ```--theme <path/to/theme>``` commandline argument.
     *
     * The theme class controls which files will be created through the [[BaseTheme.getUrls]]
     * function. It returns an array of [[UrlMapping]] instances defining the target files, models
     * and templates to use. Additionally themes can subscribe to the events emitted by
     * [[Renderer]] to control and manipulate the output process.
     *
     * The default file structure of a theme looks like this:
     *
     * - ```/assets/```<br>
     *   Contains static assets like stylesheets, images or javascript files used by the theme.
     *   The [[AssetsPlugin]] will deep copy this directory to the output directory.
     *
     * - ```/layouts/```<br>
     *   Contains layout templates that the [[LayoutPlugin]] wraps around the output of the
     *   page template. Currently only one ```default.hbs``` layout is supported. Layout templates
     *   receive the current [[OutputPageEvent]] instance as their handlebars context. Place the
     *   ```{{{contents}}}``` variable to render the actual body of the document within this template.
     *
     * - ```/partials/```<br>
     *   Contains partial templates that can be used by other templates using handlebars partial
     *   syntax ```{{> partial-name}}```. The [[PartialsPlugin]] loads all files in this directory
     *   and combines them with the partials of the default theme.
     *
     * - ```/templates/```<br>
     *   Contains the main templates of the theme. The theme maps models to these templates through
     *   the [[BaseTheme.getUrls]] function. If the [[Renderer.getTemplate]] function cannot find a
     *   given template within this directory, it will try to find it in the default theme
     *   ```/templates/``` directory. Templates receive the current [[OutputPageEvent]] instance as
     *   their handlebars context. You can access the target model through the ```{{model}}``` variable.
     *
     * - ```/theme.js```<br>
     *   A javascript file that returns the definition of a [[BaseTheme]] subclass. This file will
     *   be executed within the context of TypeDoc, one may directly access all classes and functions
     *   of TypeDoc. If this file is not present, an instance of [[DefaultTheme]] will be used to render
     *   this theme.
     */
    class Theme {
        /**
         * The renderer this theme is attached to.
         */
        renderer: Renderer;
        /**
         * The base path of this theme.
         */
        basePath: string;
        /**
         * Create a new BaseTheme instance.
         *
         * @param renderer  The renderer this theme is attached to.
         * @param basePath  The base path of this theme.
         */
        constructor(renderer: Renderer, basePath: string);
        /**
         * Test whether the given path contains a documentation generated by this theme.
         *
         * TypeDoc empties the output directory before rendering a project. This function
         * is used to ensure that only previously generated documentations are deleted.
         * When this function returns FALSE, the documentation will not be created and an
         * error message will be displayed.
         *
         * Every theme must have an own implementation of this function, the default
         * implementation always returns FALSE.
         *
         * @param path  The path of the directory that should be tested.
         * @returns     TRUE if the given path seems to be a previous output directory,
         *              otherwise FALSE.
         *
         * @see [[Renderer.prepareOutputDirectory]]
         */
        isOutputDirectory(path: string): boolean;
        /**
         * Map the models of the given project to the desired output files.
         *
         * Every theme must have an own implementation of this function, the default
         * implementation always returns an empty array.
         *
         * @param project  The project whose urls should be generated.
         * @returns        A list of [[UrlMapping]] instances defining which models
         *                 should be rendered to which files.
         */
        getUrls(project: models.ProjectReflection): UrlMapping[];
        /**
         * Create a navigation structure for the given project.
         *
         * A navigation is a tree structure consisting of [[NavigationItem]] nodes. This
         * function should return the root node of the desired navigation tree.
         *
         * The [[NavigationPlugin]] will call this hook before a project will be rendered.
         * The plugin will update the state of the navigation tree and pass it to the
         * templates.
         *
         * @param project  The project whose navigation should be generated.
         * @returns        The root navigation item.
         */
        getNavigation(project: models.ProjectReflection): NavigationItem;
    }
}
declare module td.output {
    /**
     * An event emitted by the [[MarkedPlugin]] on the [[Renderer]] after a chunk of
     * markdown has been processed. Allows other plugins to manipulate the result.
     *
     * @see [[MarkedPlugin.EVENT_PARSE_MARKDOWN]]
     */
    class MarkdownEvent extends Event {
        /**
         * The unparsed original text.
         */
        originalText: string;
        /**
         * The parsed output.
         */
        parsedText: string;
    }
}
declare module td.output {
    /**
     * An event emitted by the [[Renderer]] class at the very beginning and
     * ending of the entire rendering process.
     *
     * @see [[Renderer.EVENT_BEGIN]]
     * @see [[Renderer.EVENT_END]]
     */
    class OutputEvent extends Event {
        /**
         * The project the renderer is currently processing.
         */
        project: models.ProjectReflection;
        /**
         * The settings that have been passed to TypeDoc.
         */
        settings: IOptions;
        /**
         * The path of the directory the documentation should be written to.
         */
        outputDirectory: string;
        /**
         * A list of all pages that should be generated.
         *
         * This list can be altered during the [[Renderer.EVENT_BEGIN]] event.
         */
        urls: UrlMapping[];
        /**
         * Create an [[OutputPageEvent]] event based on this event and the given url mapping.
         *
         * @internal
         * @param mapping  The mapping that defines the generated [[OutputPageEvent]] state.
         * @returns A newly created [[OutputPageEvent]] instance.
         */
        createPageEvent(mapping: UrlMapping): OutputPageEvent;
    }
}
declare module td.output {
    /**
     * An event emitted by the [[Renderer]] class before and after the
     * markup of a page is rendered.
     *
     * This object will be passed as the rendering context to handlebars templates.
     *
     * @see [[Renderer.EVENT_BEGIN_PAGE]]
     * @see [[Renderer.EVENT_END_PAGE]]
     */
    class OutputPageEvent extends Event {
        /**
         * The project the renderer is currently processing.
         */
        project: models.ProjectReflection;
        /**
         * The settings that have been passed to TypeDoc.
         */
        settings: IOptions;
        /**
         * The filename the page will be written to.
         */
        filename: string;
        /**
         * The url this page will be located at.
         */
        url: string;
        /**
         * The model that should be rendered on this page.
         */
        model: any;
        /**
         * The template that should be used to render this page.
         */
        template: IHandlebarTemplate;
        /**
         * The name of the template that should be used to render this page.
         */
        templateName: string;
        /**
         * The primary navigation structure of this page.
         */
        navigation: NavigationItem;
        /**
         * The table of contents structure of this page.
         */
        toc: NavigationItem;
        /**
         * The final html content of this page.
         *
         * Should be rendered by layout templates and can be modifies by plugins.
         */
        contents: string;
    }
}
declare module td.output {
    /**
     * A hierarchical model holding the data of single node within the navigation.
     *
     * This structure is used by the [[NavigationPlugin]] and [[TocPlugin]] to expose the current
     * navigation state to the template engine. Themes should generate the primary navigation structure
     * through the [[BaseTheme.getNavigation]] method.
     */
    class NavigationItem {
        /**
         * The visible title of the navigation node.
         */
        title: string;
        /**
         * The url this navigation node points to.
         */
        url: string;
        /**
         * A list of urls that should be seen as sub-pages of this node.
         */
        dedicatedUrls: string[];
        /**
         * The parent navigation node.
         */
        parent: NavigationItem;
        /**
         * An array containing all child navigation nodes.
         */
        children: NavigationItem[];
        /**
         * A string containing the css classes of this node.
         */
        cssClasses: string;
        /**
         * Is this item a simple label without a link?
         */
        isLabel: boolean;
        /**
         * Is this item visible?
         */
        isVisible: boolean;
        /**
         * Does this navigation node represent the current page?
         */
        isCurrent: boolean;
        /**
         * Is this the navigation node for the globals page?
         */
        isGlobals: boolean;
        /**
         * Is this navigation node one of the parents of the current page?
         */
        isInPath: boolean;
        /**
         * Create a new NavigationItem instance.
         *
         * @param title       The visible title of the navigation node.
         * @param url         The url this navigation node points to.
         * @param parent      The parent navigation node.
         * @param cssClasses  A string containing the css classes of this node.
         */
        constructor(title?: string, url?: string, parent?: NavigationItem, cssClasses?: string);
        /**
         * Create a navigation node for the given reflection.
         *
         * @param reflection     The reflection whose navigation node should be created.
         * @param parent         The parent navigation node.
         * @param useShortNames  Force this function to always use short names.
         */
        static create(reflection: models.Reflection, parent?: NavigationItem, useShortNames?: boolean): NavigationItem;
    }
}
declare module td.output {
    /**
     *
     */
    class UrlMapping {
        url: string;
        model: any;
        template: string;
        constructor(url: string, model: any, template: string);
    }
}
declare module td.output {
    /**
     * A plugin that copies the subdirectory ´assets´ from the current themes
     * source folder to the output directory.
     */
    class AssetsPlugin extends RendererPlugin {
        /**
         * Should the default assets always be copied to the output directory?
         */
        copyDefaultAssets: boolean;
        /**
         * Create a new AssetsPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event);
    }
}
declare module td.output {
    /**
     * A plugin that exports an index of the project to a javascript file.
     *
     * The resulting javascript file can be used to build a simple search function.
     */
    class JavascriptIndexPlugin extends RendererPlugin {
        /**
         * Create a new JavascriptIndexPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event);
    }
}
declare module td.output {
    /**
     * A plugin that wraps the generated output with a layout template.
     *
     * Currently only a default layout is supported. The layout must be stored
     * as ´layouts/default.hbs´ in the theme directory.
     */
    class LayoutPlugin extends RendererPlugin {
        /**
         * Create a new LayoutPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererEndPage(page);
    }
}
declare module td.output {
    /**
     * A plugin that builds links in markdown texts.
     */
    class MarkedLinksPlugin extends ContextAwareRendererPlugin {
        /**
         * Regular expression for detecting bracket links.
         */
        private brackets;
        /**
         * Regular expression for detecting inline tags like {@link ...}.
         */
        private inlineTag;
        /**
         * Regular expression to test if a string looks like an external url.
         */
        private urlPrefix;
        /**
         * Create a new MarkedLinksPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Find all references to symbols within the given text and transform them into a link.
         *
         * This function is aware of the current context and will try to find the symbol within the
         * current reflection. It will walk up the reflection chain till the symbol is found or the
         * root reflection is reached. As a last resort the function will search the entire project
         * for the given symbol.
         *
         * @param text  The text that should be parsed.
         * @returns The text with symbol references replaced by links.
         */
        private replaceBrackets(text);
        /**
         * Find symbol {@link ...} strings in text and turn into html links
         *
         * @param text  The string in which to replace the inline tags.
         * @return      The updated string.
         */
        private replaceInlineTags(text);
        /**
         * Format a link with the given text and target.
         *
         * @param original   The original link string, will be returned if the target cannot be resolved..
         * @param target     The link target.
         * @param caption    The caption of the link.
         * @param monospace  Whether to use monospace formatting or not.
         * @returns A html link tag.
         */
        private buildLink(original, target, caption, monospace?);
        /**
         * Triggered when [[MarkedPlugin]] parses a markdown string.
         *
         * @param event
         */
        onParseMarkdown(event: MarkdownEvent): void;
        /**
         * Split the given link into text and target at first pipe or space.
         *
         * @param text  The source string that should be checked for a split character.
         * @returns An object containing the link text and target.
         */
        static splitLinkText(text: string): {
            caption: string;
            target: string;
        };
    }
}
declare module td {
    interface IOptions {
        /**
         * Specifies the location to look for included documents.
         */
        includes?: string;
        /**
         * Specifies the location with media files that should be copied to the output directory.
         */
        media?: string;
    }
}
declare module td.output {
    /**
     * A plugin that exposes the markdown, compact and relativeURL helper to handlebars.
     *
     * Templates should parse all comments with the markdown handler so authors can
     * easily format their documentation. TypeDoc uses the Marked (https://github.com/chjj/marked)
     * markdown parser and HighlightJS (https://github.com/isagalaev/highlight.js) to highlight
     * code blocks within markdown sections. Additionally this plugin allows to link to other symbols
     * using double angle brackets.
     *
     * You can use the markdown helper anywhere in the templates to convert content to html:
     *
     * ```handlebars
     * {{#markdown}}{{{comment.text}}}{{/markdown}}
     * ```
     *
     * The compact helper removes all newlines of its content:
     *
     * ```handlebars
     * {{#compact}}
     *   Compact
     *   this
     * {{/compact}}
     * ```
     *
     * The relativeURL helper simply transforms an absolute url into a relative url:
     *
     * ```handlebars
     * {{#relativeURL url}}
     * ```
     */
    class MarkedPlugin extends ContextAwareRendererPlugin implements IParameterProvider {
        /**
         * The path referenced files are located in.
         */
        private includes;
        /**
         * Path to the output media directory.
         */
        private mediaDirectory;
        /**
         * The pattern used to find references in markdown.
         */
        private includePattern;
        /**
         * The pattern used to find media links.
         */
        private mediaPattern;
        /**
         * Triggered on the renderer when this plugin parses a markdown string.
         * @event
         */
        static EVENT_PARSE_MARKDOWN: string;
        /**
         * Create a new MarkedPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        getParameters(): IParameter[];
        /**
         * Compress the given string by removing all newlines.
         *
         * @param text  The string that should be compressed.
         * @returns The string with all newlsines stripped.
         */
        getCompact(text: string): string;
        /**
         * Insert word break tags ``<wbr>`` into the given string.
         *
         * Breaks the given string at ``_``, ``-`` and captial letters.
         *
         * @param str  The string that should be split.
         * @return     The original string containing ``<wbr>`` tags where possible.
         */
        getWordBreaks(str: string): string;
        /**
         * Highlight the synatx of the given text using HighlightJS.
         *
         * @param text  The text taht should be highlightes.
         * @param lang  The language that should be used to highlight the string.
         * @return A html string with syntax highlighting.
         */
        getHighlighted(text: string, lang?: string): string;
        /**
         * Handlebars if helper with condition.
         *
         * @param v1        The first value to be compared.
         * @param operator  The operand to perform on the two given values.
         * @param v2        The second value to be compared
         * @param options   The current handlebars object.
         * @param context   The current handlebars context.
         * @returns {*}
         */
        getIfCond(v1: any, operator: any, v2: any, options: any, context: any): any;
        /**
         * Parse the given markdown string and return the resulting html.
         *
         * @param text  The markdown string that should be parsed.
         * @param context  The current handlebars context.
         * @returns The resulting html string.
         */
        parseMarkdown(text: string, context: any): string;
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        protected onRendererBegin(event: OutputEvent): void;
        /**
         * Triggered when [[MarkedPlugin]] parses a markdown string.
         *
         * @param event
         */
        onParseMarkdown(event: MarkdownEvent): void;
    }
}
declare module td.output {
    /**
     * A plugin that exposes the navigation structure of the documentation
     * to the rendered templates.
     *
     * The navigation structure is generated using the current themes
     * [[BaseTheme.getNavigation]] function. This plugins takes care that the navigation
     * is updated and passed to the render context.
     */
    class NavigationPlugin extends RendererPlugin {
        /**
         * The navigation structure generated by the current theme.
         */
        navigation: NavigationItem;
        /**
         * Create a new NavigationPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event);
        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererBeginPage(page);
    }
}
declare module td.output {
    /**
     * A plugin that loads all partials of the current theme.
     *
     * Partials must be placed in the ´partials´ subdirectory of the theme. The plugin first
     * loads the partials of the default theme and then the partials of the current theme.
     */
    class PartialsPlugin extends RendererPlugin {
        /**
         * Create a new PartialsPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Load all files in the given directory and registers them as partials.
         *
         * @param path  The path of the directory that should be scanned.
         */
        private loadPartials(path);
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event);
    }
}
declare module td.output {
    /**
     * A plugin that pretty prints the generated html.
     *
     * This not only aids in making the generated html source code more readable, by removing
     * blank lines and unnecessary whitespaces the size of the documentation is reduced without
     * visual impact.
     *
     * At the point writing this the docs of TypeDoc took 97.8 MB  without and 66.4 MB with this
     * plugin enabled, so it reduced the size to 68% of the original output.
     */
    class PrettyPrintPlugin extends RendererPlugin {
        /**
         * Map of all tags that will be ignored.
         */
        static IGNORED_TAGS: any;
        /**
         * Map of all tags that prevent this plugin form modifying the following code.
         */
        static PRE_TAGS: any;
        /**
         * Create a new PrettyPrintPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Triggered after a document has been rendered, just before it is written to disc.
         *
         * @param event
         */
        onRendererEndPage(event: OutputPageEvent): void;
    }
}
declare module td.output {
    /**
     * A plugin that generates a table of contents for the current page.
     *
     * The table of contents will start at the nearest module or dynamic module. This plugin
     * sets the [[OutputPageEvent.toc]] property.
     */
    class TocPlugin extends RendererPlugin {
        /**
         * Create a new TocPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererBeginPage(page);
        /**
         * Create a toc navigation item structure.
         *
         * @param model   The models whose children should be written to the toc.
         * @param trail   Defines the active trail of expanded toc entries.
         * @param parent  The parent [[NavigationItem]] the toc should be appended to.
         */
        static buildToc(model: models.Reflection, trail: models.Reflection[], parent: NavigationItem): void;
    }
}
declare module td {
    interface IOptions {
        /**
         * The Google Analytics tracking ID that should be used. When not set, the tracking code
         * should be omitted.
         */
        gaID?: string;
        /**
         * Optional site name for Google Analytics. Defaults to `auto`.
         */
        gaSite?: string;
        /**
         * Should we hide the TypeDoc link at the end of the page?
         */
        hideGenerator?: boolean;
        /**
         * Specifies the fully qualified name of the root symbol. Defaults to global namespace.
         */
        entryPoint?: string;
    }
}
declare module td.output {
    /**
     * Defines a mapping of a [[Models.Kind]] to a template file.
     *
     * Used by [[DefaultTheme]] to map reflections to output files.
     */
    interface ITemplateMapping {
        /**
         * [[DeclarationReflection.kind]] this rule applies to.
         */
        kind: models.ReflectionKind[];
        /**
         * Can this mapping have children or should all further reflections be rendered
         * to the defined output page?
         */
        isLeaf: boolean;
        /**
         * The name of the directory the output files should be written to.
         */
        directory: string;
        /**
         * The name of the template that should be used to render the reflection.
         */
        template: string;
    }
    /**
     * Default theme implementation of TypeDoc. If a theme does not provide a custom
     * [[BaseTheme]] implementation, this theme class will be used.
     */
    class DefaultTheme extends Theme implements IParameterProvider {
        /**
         * Mappings of reflections kinds to templates used by this theme.
         */
        static MAPPINGS: ITemplateMapping[];
        /**
         * Create a new DefaultTheme instance.
         *
         * @param renderer  The renderer this theme is attached to.
         * @param basePath  The base path of this theme.
         */
        constructor(renderer: Renderer, basePath: string);
        /**
         * Test whether the given path contains a documentation generated by this theme.
         *
         * @param path  The path of the directory that should be tested.
         * @returns     TRUE if the given path seems to be a previous output directory,
         *              otherwise FALSE.
         */
        isOutputDirectory(path: string): boolean;
        getParameters(): IParameter[];
        /**
         * Map the models of the given project to the desired output files.
         *
         * @param project  The project whose urls should be generated.
         * @returns        A list of [[UrlMapping]] instances defining which models
         *                 should be rendered to which files.
         */
        getUrls(project: models.ProjectReflection): UrlMapping[];
        /**
         * Return the entry point of the documentation.
         *
         * @param project  The current project.
         * @returns The reflection that should be used as the entry point.
         */
        getEntryPoint(project: models.ProjectReflection): models.ContainerReflection;
        /**
         * Create a navigation structure for the given project.
         *
         * @param project  The project whose navigation should be generated.
         * @returns        The root navigation item.
         */
        getNavigation(project: models.ProjectReflection): NavigationItem;
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event);
        /**
         * Return a url for the given reflection.
         *
         * @param reflection  The reflection the url should be generated for.
         * @param relative    The parent reflection the url generation should stop on.
         * @param separator   The separator used to generate the url.
         * @returns           The generated url.
         */
        static getUrl(reflection: models.Reflection, relative?: models.Reflection, separator?: string): string;
        /**
         * Return the template mapping fore the given reflection.
         *
         * @param reflection  The reflection whose mapping should be resolved.
         * @returns           The found mapping or NULL if no mapping could be found.
         */
        static getMapping(reflection: models.DeclarationReflection): ITemplateMapping;
        /**
         * Build the url for the the given reflection and all of its children.
         *
         * @param reflection  The reflection the url should be created for.
         * @param urls        The array the url should be appended to.
         * @returns           The altered urls array.
         */
        static buildUrls(reflection: models.DeclarationReflection, urls: UrlMapping[]): UrlMapping[];
        /**
         * Generate an anchor url for the given reflection and all of its children.
         *
         * @param reflection  The reflection an anchor url should be created for.
         * @param container   The nearest reflection having an own document.
         */
        static applyAnchorUrl(reflection: models.Reflection, container: models.Reflection): void;
        /**
         * Generate the css classes for the given reflection and apply them to the
         * [[DeclarationReflection.cssClasses]] property.
         *
         * @param reflection  The reflection whose cssClasses property should be generated.
         */
        static applyReflectionClasses(reflection: models.DeclarationReflection): void;
        /**
         * Generate the css classes for the given reflection group and apply them to the
         * [[ReflectionGroup.cssClasses]] property.
         *
         * @param group  The reflection group whose cssClasses property should be generated.
         */
        static applyGroupClasses(group: models.ReflectionGroup): void;
        /**
         * Transform a space separated string into a string suitable to be used as a
         * css class, e.g. "constructor method" > "Constructor-method".
         */
        static toStyleClass(str: string): string;
    }
}
declare module td.output {
    class MinimalTheme extends DefaultTheme {
        /**
         * Create a new DefaultTheme instance.
         *
         * @param renderer  The renderer this theme is attached to.
         * @param basePath  The base path of this theme.
         */
        constructor(renderer: Renderer, basePath: string);
        /**
         * Test whether the given path contains a documentation generated by this theme.
         *
         * @param path  The path of the directory that should be tested.
         * @returns     TRUE if the given path seems to be a previous output directory,
         *              otherwise FALSE.
         */
        isOutputDirectory(path: string): boolean;
        /**
         * Map the models of the given project to the desired output files.
         *
         * @param project  The project whose urls should be generated.
         * @returns        A list of [[UrlMapping]] instances defining which models
         *                 should be rendered to which files.
         */
        getUrls(project: models.ProjectReflection): UrlMapping[];
        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererBeginPage(page);
        /**
         * Create a toc navigation item structure.
         *
         * @param model   The models whose children should be written to the toc.
         * @param parent  The parent [[Models.NavigationItem]] the toc should be appended to.
         */
        static buildToc(model: models.DeclarationReflection, parent: NavigationItem): void;
    }
}
