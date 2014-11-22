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
    var tsPath: any;
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
declare module td {
    /**
     * Alias to ts.ScriptTarget
     * @resolve
     */
    var ScriptTarget: typeof ts.ScriptTarget;
    /**
     * Alias to ts.ModuleKind
     * @resolve
     */
    var ModuleKind: typeof ts.ModuleKind;
    enum OptionScope {
        TypeDoc = 0,
        TypeScript = 1,
    }
    interface IOptionDeclaration extends ts.CommandLineOption {
        scope: OptionScope;
    }
    var ignoredTypeScriptOptions: string[];
    /**
     * Modify ts.optionDeclarations to match TypeDoc requirements.
     */
    var optionDeclarations: IOptionDeclaration[];
    /**
     * Holds all settings used by TypeDoc.
     */
    class Settings {
        /**
         * The settings used by the TypeScript compiler.
         *
         * @see [[CodeGenTarget]]
         * @see [[ModuleGenTarget]]
         */
        compilerOptions: ts.CompilerOptions;
        /**
         * The list of source files that should be processed.
         */
        inputFiles: string[];
        /**
         * The path of the output directory.
         */
        out: string;
        /**
         * Path and filename of the json file.
         */
        json: string;
        /**
         * The path of the theme that should be used.
         */
        theme: string;
        /**
         * The human readable name of the project. Used within the templates to set the title of the document.
         */
        name: string;
        /**
         * The location of the readme file that should be displayed on the index page. Set this to 'none' to
         * remove the index page and start with the globals page.
         */
        readme: string;
        /**
         * A pattern for files that should be excluded when a path is specified as source.
         */
        excludePattern: string;
        /**
         * Should declaration files be documented?
         */
        includeDeclarations: boolean;
        /**
         * Should externally resolved TypeScript files be ignored?
         */
        excludeExternals: boolean;
        /**
         * Define a pattern for files that should be considered being external.
         */
        externalPattern: string;
        /**
         * The Google Analytics tracking ID that should be used. When not set, the tracking code
         * should be omitted.
         */
        gaID: string;
        /**
         * Optional site name for Google Analytics. Defaults to `auto`.
         */
        gaSite: string;
        /**
         * Does the user want to display the help message?
         */
        needsHelp: boolean;
        /**
         * Does the user want to know the version number?
         */
        shouldPrintVersionOnly: boolean;
        /**
         * Should we hide the TypeDoc link at the end of the page?
         */
        hideGenerator: boolean;
        /**
         * Should verbose messages be printed?
         */
        verbose: boolean;
        private declarations;
        private shortOptionNames;
        /**
         * Create a new Settings instance.
         */
        constructor();
        /**
         *
         * @param option
         */
        addOptionDeclaration(option: IOptionDeclaration): void;
        /**
         *
         * @param name
         * @returns {*}
         */
        getOptionDeclaration(name: string): IOptionDeclaration;
        /**
         * Expand the list of input files.
         *
         * Searches for directories in the input files list and replaces them with a
         * listing of all TypeScript files within them. One may use the ```--excludePattern``` option
         * to filter out files with a pattern.
         */
        expandInputFiles(): void;
        parseCommandLine(logger: ILogger): boolean;
        parseArguments(args: string[], logger: ILogger): boolean;
        parseResponseFile(filename: string, logger: ILogger): boolean;
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
     * List of known log levels. Used to specify the urgency of a log message.
     *
     * @see [[Application.log]]
     */
    enum LogLevel {
        Verbose = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
    }
    interface ILogger {
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         */
        log(message: string, level?: LogLevel): void;
    }
    /**
     * An interface of the application class.
     *
     * All classes should expect this interface allowing other third parties
     * to use their own implementation.
     */
    interface IApplication extends ILogger {
        /**
         * The settings used by the dispatcher and the renderer.
         */
        settings: Settings;
    }
    function writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
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
    class Application implements ILogger, IApplication {
        /**
         * The settings used by the dispatcher and the renderer.
         */
        settings: Settings;
        /**
         * The converter used to create the declaration reflections.
         */
        converter: Converter;
        /**
         * The renderer used to generate the documentation output.
         */
        renderer: Renderer;
        /**
         * Has an error been raised through the log method?
         */
        hasErrors: boolean;
        /**
         * The version number of TypeDoc.
         */
        static VERSION: string;
        /**
         * Create a new Application instance.
         *
         * @param settings  The settings used by the dispatcher and the renderer.
         */
        constructor(settings?: Settings);
        /**
         * Run TypeDoc from the command line.
         */
        runFromCommandline(): void;
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level    The urgency of the log message.
         */
        log(message: string, level?: LogLevel): void;
        /**
         * Run the documentation generator for the given set of files.
         *
         * @param inputFiles  A list of source files whose documentation should be generated.
         * @param outputDirectory  The path of the directory the documentation should be written to.
         */
        generate(inputFiles: string[], outputDirectory: string): void;
        /**
         * Return the version number of the loaded TypeScript compiler.
         *
         * @returns The version number of the loaded TypeScript package.
         */
        getTypeScriptVersion(): string;
    }
}
declare module td {
    interface IPluginInterface {
        remove(): any;
    }
    class PluginHost extends EventDispatcher {
        plugins: ts.Map<IPluginInterface>;
        static PLUGINS: {
            [x: string]: any;
        };
        addPlugin(name: string, plugin: any): IPluginInterface;
        removePlugin(name: string): boolean;
        removeAllPlugins(): void;
        static registerPlugin(name: string, plugin: any): void;
        static loadPlugins(instance: any): ts.Map<IPluginInterface>;
    }
}
declare module td {
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
declare module td {
    /**
     * Return a string that explains the given flag bit mask.
     *
     * @param value  A bit mask containing TypeScript.PullElementFlags bits.
     * @returns A string describing the given bit mask.
     */
    function flagsToString(value: any, flags: any): string;
    interface IConverterResult {
        project: any;
        errors: ts.Diagnostic[];
    }
    class Converter extends PluginHost {
        static EVENT_BEGIN: string;
        static EVENT_END: string;
        static EVENT_FILE_BEGIN: string;
        static EVENT_CREATE_DECLARATION: string;
        static EVENT_CREATE_SIGNATURE: string;
        static EVENT_RESOLVE_BEGIN: string;
        static EVENT_RESOLVE_END: string;
        static EVENT_RESOLVE: string;
        constructor();
        /**
         * Compile the given source files and create a reflection tree for them.
         *
         * @param fileNames  Array of the file names that should be compiled.
         * @param settings   The settings that should be used to compile the files.
         */
        convert(fileNames: string[], settings: Settings): IConverterResult;
        /**
         * Create the compiler host.
         *
         * Taken from TypeScript source files.
         * @see https://github.com/Microsoft/TypeScript/blob/master/src/compiler/tsc.ts#L136
         */
        createCompilerHost(options: ts.CompilerOptions): ts.CompilerHost;
    }
}
declare module td {
    class ConverterEvent extends Event {
        private _checker;
        private _project;
        private _settings;
        constructor(checker: ts.TypeChecker, project: ProjectReflection, settings: Settings);
        getTypeChecker(): ts.TypeChecker;
        getProject(): ProjectReflection;
        getSettings(): Settings;
    }
}
declare module td {
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
declare module td {
    class CompilerEvent extends ConverterEvent {
        reflection: Reflection;
        node: ts.Node;
    }
}
declare module td {
    class ResolveEvent extends ConverterEvent {
        reflection: Reflection;
    }
}
declare module td {
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
         * Create a new CommentPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        private storeModuleComment(comment, reflection);
        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event);
        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Invokes the comment parser.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event);
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBeginResolve(event);
        /**
         * Triggered when the dispatcher resolves a reflection.
         *
         * Cleans up comment tags related to signatures like @param or @return
         * and moves their data to the corresponding parameter reflections.
         *
         * This hook also copies over the comment of function implementations to their
         * signatures.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event);
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
        static removeTags(comment: Comment, tagName: string): void;
        /**
         * Parse the given doc comment string.
         *
         * @param text     The doc comment string that should be parsed.
         * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
         * @returns        A populated [[Models.Comment]] instance.
         */
        static parseComment(text: string, comment?: Comment): Comment;
    }
}
declare module td {
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
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event);
    }
}
declare module td {
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
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event);
        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event);
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onBeginResolve(event);
    }
}
declare module td {
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
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onEndResolve(event);
    }
}
declare module td {
    /**
     * A handler that sorts and groups the found reflections in the resolving phase.
     *
     * The handler sets the ´groups´ property of all reflections.
     */
    class GroupPlugin extends ConverterPlugin {
        /**
         * Define the sort order of reflections.
         */
        static WEIGHTS: ReflectionKind[];
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
         * Triggered once after all documents have been read and the dispatcher
         * leaves the resolving phase.
         */
        private onEndResolve(event);
        /**
         * Create a grouped representation of the given list of reflections.
         *
         * Reflections are grouped by kind and sorted by weight and name.
         *
         * @param reflections  The reflections that should be grouped.
         * @returns An array containing all children of the given reflection grouped by their kind.
         */
        static getReflectionGroups(reflections: DeclarationReflection[]): ReflectionGroup[];
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
        static getKindSingular(kind: ReflectionKind): string;
        /**
         * Return the plural name of a internal typescript kind identifier.
         *
         * @param kind The original internal typescript kind identifier.
         * @returns The plural name of the given internal typescript kind identifier
         */
        static getKindPlural(kind: ReflectionKind): string;
        /**
         * Callback used to sort reflections by weight defined by ´GroupPlugin.WEIGHTS´ and name.
         *
         * @param a The left reflection to sort.
         * @param b The right reflection to sort.
         * @returns The sorting weight.
         */
        static sortCallback(a: Reflection, b: Reflection): number;
    }
}
declare module td {
    /**
     * A handler that tries to find the package.json and readme.md files of the
     * current project.
     *
     * The handler traverses the file tree upwards for each file processed by the processor
     * and records the nearest package info files it can find. Within the resolve files, the
     * contents of the found files will be read and appended to the ProjectReflection.
     */
    class PackagePlugin extends ConverterPlugin {
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
        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event);
        /**
         * Triggered when the dispatcher begins processing a typescript document.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(event);
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the project and compiler.
         */
        private onBeginResolve(event);
    }
}
declare module td {
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
         * Triggered when the dispatcher starts processing a TypeScript document.
         *
         * Create a new [[SourceFile]] instance for all TypeScript files.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(event);
        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event);
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBeginResolve(event);
        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event);
        /**
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onEndResolve(event);
    }
}
declare module td {
    /**
     * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
     */
    class TypePlugin extends ConverterPlugin {
        reflections: DeclarationReflection[];
        /**
         * Create a new TypeHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter: Converter);
        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event);
        private postpone(reflection);
        /**
         * Return the simplified type hierarchy for the given reflection.
         *
         * @TODO Type hierarchies for interfaces with multiple parent interfaces.
         *
         * @param reflection The reflection whose type hierarchy should be generated.
         * @returns The root of the generated type hierarchy.
         */
        private onResolveEnd(event);
    }
}
declare module td {
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
         * Return a raw object representation of this comment.
         */
        toObject(): any;
    }
}
declare module td {
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
declare module td {
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
        static create(reflection: Reflection, parent?: NavigationItem, useShortNames?: boolean): NavigationItem;
    }
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
declare module td {
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
        ClassOrInterface,
        VariableOrProperty,
        FunctionOrMethod,
        SomeSignature,
        SomeModule,
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
        ConstructorSignatures = 4,
        CallSignatures = 5,
        IndexSignature = 6,
        GetSignature = 7,
        SetSignature = 8,
    }
    interface ITraverseCallback {
        (reflection: Reflection, property: TraverseProperty): void;
    }
    interface ILocation {
        /**
         * The url of this reflection in the generated documentation.
         */
        url: string;
        /**
         * The name of the anchor of this child.
         */
        anchor?: string;
        /**
         * Is the url pointing to an individual document?
         *
         * When FALSE, the url points to an anchor tag on a page of a different reflection.
         */
        hasOwnDocument?: boolean;
        /**
         * A list of generated css classes that should be applied to representations of this
         * reflection in the generated markup.
         */
        cssClasses?: string;
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
        location: ILocation;
        /**
         * Url safe alias for this reflection.
         *
         * @see [[BaseReflection.getAlias]]
         */
        private _alias;
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
         * Return an url safe alias for this reflection.
         */
        getAlias(): string;
        /**
         * Has this reflection a visible comment?
         *
         * @returns TRUE when this reflection has a visible comment.
         */
        hasComment(): boolean;
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
declare module td {
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
declare module td {
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
            [x: string]: SourceDirectory;
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
declare module td {
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
declare module td {
    class Type {
        isArray: boolean;
        toString(): string;
    }
}
declare module td {
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
declare module td {
    class ContainerReflection extends Reflection {
        parent: ContainerReflection;
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
declare module td {
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
        callSignatures: SignatureReflection[];
        /**
         * A list of constructor signatures attached to this declaration.
         *
         * TypeDoc creates one declaration per constructor that may contain ore or more
         * signature reflections.
         */
        constructorSignatures: SignatureReflection[];
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
         * Is this a private member?
         */
        isPrivate: boolean;
        /**
         * Is this a protected member?
         */
        isProtected: boolean;
        /**
         * Is this a public member?
         */
        isPublic: boolean;
        /**
         * Is this a static member?
         */
        isStatic: boolean;
        /**
         * Is this member exported?
         */
        isExported: boolean;
        /**
         * Is this a declaration from an external document?
         */
        isExternal: boolean;
        /**
         * Whether this reflection is an optional component or not.
         *
         * Applies to function parameters and object members.
         */
        isOptional: boolean;
        hasExportAssignment: boolean;
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
        /**
         * Is this reflection representing a container like a module or class?
        isContainer() {
            return this.kindOf(TypeScript.PullElementKind.SomeContainer);
        }
         */
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
declare module td {
    class ParameterReflection extends Reflection implements IDefaultValueContainer, ITypeContainer {
        parent: SignatureReflection;
        defaultValue: string;
        type: Type;
        isOptional: boolean;
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
         * Return a string representation of this reflection.
         */
        toString(): string;
    }
}
declare module td {
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
            [x: number]: Reflection;
        };
        nodeMapping: {
            [x: number]: number;
        };
        symbolMapping: {
            [x: number]: number;
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
declare module td {
    class SignatureReflection extends Reflection implements ITypeContainer, ITypeParameterContainer {
        parent: ContainerReflection;
        parameters: ParameterReflection[];
        typeParameters: TypeParameterReflection[];
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
         * Return a string representation of this reflection.
         */
        toString(): string;
    }
}
declare module td {
    class TypeParameterReflection extends Reflection implements ITypeContainer {
        parent: DeclarationReflection;
        type: Type;
        /**
         * Create a new TypeParameterReflection instance.
         */
        constructor(parent?: Reflection, type?: TypeParameterType);
    }
}
declare module td {
    class IntrinsicType extends Type {
        name: string;
        constructor(name: string);
        toString(): string;
    }
}
declare module td {
    class ReferenceType extends Type {
        symbolID: number;
        reflection: Reflection;
        constructor(symbolID: number, reflection?: Reflection);
        toString(): string;
    }
}
declare module td {
    class ReflectionType extends Type {
        declaration: DeclarationReflection;
        constructor(declaration: DeclarationReflection);
        toString(): string;
    }
}
declare module td {
    class StringLiteralType extends Type {
        value: string;
        constructor(value: string);
        toString(): string;
    }
}
declare module td {
    class TupleType extends Type {
        elements: Type[];
        constructor(elements: Type[]);
        toString(): string;
    }
}
declare module td {
    class TypeParameterType extends Type {
        name: string;
        constraint: Type;
        toString(): string;
    }
}
declare module td {
    class UnknownType extends Type {
        name: string;
        constructor(name: string);
    }
}
declare module td {
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
    class BaseTheme {
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
        getUrls(project: ProjectReflection): UrlMapping[];
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
        getNavigation(project: ProjectReflection): NavigationItem;
    }
}
declare module td {
    /**
     * Defines a mapping of a [[Models.Kind]] to a template file.
     *
     * Used by [[DefaultTheme]] to map reflections to output files.
     */
    interface ITemplateMapping {
        /**
         * [[DeclarationReflection.kind]] this rule applies to.
         */
        kind: ReflectionKind[];
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
    class DefaultTheme extends BaseTheme {
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
        /**
         * Map the models of the given project to the desired output files.
         *
         * @param project  The project whose urls should be generated.
         * @returns        A list of [[UrlMapping]] instances defining which models
         *                 should be rendered to which files.
         */
        getUrls(project: ProjectReflection): UrlMapping[];
        /**
         * Create a navigation structure for the given project.
         *
         * @param project  The project whose navigation should be generated.
         * @returns        The root navigation item.
         */
        getNavigation(project: ProjectReflection): NavigationItem;
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
        static getUrl(reflection: Reflection, relative?: Reflection, separator?: string): string;
        /**
         * Return the template mapping fore the given reflection.
         *
         * @param reflection  The reflection whose mapping should be resolved.
         * @returns           The found mapping or NULL if no mapping could be found.
         */
        static getMapping(reflection: DeclarationReflection): ITemplateMapping;
        /**
         * Build the url for the the given reflection and all of its children.
         *
         * @param reflection  The reflection the url should be created for.
         * @param urls        The array the url should be appended to.
         * @returns           The altered urls array.
         */
        static buildUrls(reflection: DeclarationReflection, urls: UrlMapping[]): UrlMapping[];
        /**
         * Generate an anchor url for the given reflection and all of its children.
         *
         * @param reflection  The reflection an anchor url should be created for.
         * @param container   The nearest reflection having an own document.
         */
        static applyAnchorUrl(reflection: DeclarationReflection, container: ContainerReflection): void;
        /**
         * Generate the css classes for the given reflection and apply them to the
         * [[DeclarationReflection.cssClasses]] property.
         *
         * @param reflection  The reflection whose cssClasses property should be generated.
         */
        static applyReflectionClasses(reflection: DeclarationReflection): void;
        /**
         * Generate the css classes for the given reflection group and apply them to the
         * [[ReflectionGroup.cssClasses]] property.
         *
         * @param group  The reflection group whose cssClasses property should be generated.
         */
        static applyGroupClasses(group: ReflectionGroup): void;
        /**
         * Transform a space separated string into a string suitable to be used as a
         * css class, e.g. "constructor method" > "Constructor-method".
         */
        static toStyleClass(str: string): string;
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
declare module td {
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
    class Renderer extends EventDispatcher {
        /**
         * The application this dispatcher is attached to.
         */
        application: IApplication;
        /**
         * List of all plugins that are attached to the renderer.
         */
        plugins: RendererPlugin[];
        /**
         * The theme that is used to render the documentation.
         */
        theme: BaseTheme;
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
         * Registry containing the plugins, that should be created by default.
         */
        static PLUGIN_CLASSES: any[];
        /**
         * Create a new Renderer instance.
         *
         * @param application  The application this dispatcher is attached to.
         */
        constructor(application: IApplication);
        /**
         * Add a plugin to the renderer.
         *
         * @param pluginClass  The class of the plugin that should be attached.
         */
        addPlugin(pluginClass: typeof RendererPlugin): void;
        /**
         * Remove a plugin from the renderer.
         *
         * @param pluginClass  The class of the plugin that should be detached.
         */
        removePlugin(pluginClass: typeof RendererPlugin): void;
        /**
         * Retrieve a plugin instance.
         *
         * @param pluginClass  The class of the plugin that should be retrieved.
         * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
         */
        getPlugin(pluginClass: typeof RendererPlugin): RendererPlugin;
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
        render(project: ProjectReflection, outputDirectory: string): void;
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
declare module td {
    /**
     * Base class of all plugins that can be attached to the [[Renderer]].
     */
    class RendererPlugin {
        /**
         * The renderer this plugin is attached to.
         */
        renderer: Renderer;
        /**
         * Create a new BasePlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer: Renderer);
        /**
         * Remove this plugin from the renderer.
         */
        remove(): void;
    }
}
declare module td {
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
        project: ProjectReflection;
        /**
         * The settings that have been passed to TypeDoc.
         */
        settings: Settings;
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
declare module td {
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
        project: ProjectReflection;
        /**
         * The settings that have been passed to TypeDoc.
         */
        settings: Settings;
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
declare module td {
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
declare module td {
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
declare module td {
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
declare module td {
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
    class MarkedPlugin extends RendererPlugin {
        /**
         * The project that is currently processed.
         */
        private project;
        /**
         * The reflection that is currently processed.
         */
        private reflection;
        /**
         * The url of the documenat that is being currently generated.
         */
        private location;
        /**
         * Create a new MarkedPlugin instance.
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
         * @returns The resulting html string.
         */
        parseMarkdown(text: string): string;
        /**
         * Find all references to symbols within the given text and transform them into a link.
         *
         * The references must be surrounded with double angle brackets. When the reference could
         * not be found, the original text containing the brackets will be returned.
         *
         * This function is aware of the current context and will try to find the symbol within the
         * current reflection. It will walk up the reflection chain till the symbol is found or the
         * root reflection is reached. As a last resort the function will search the entire project
         * for the given symbol.
         *
         * @param text  The text that should be parsed.
         * @returns The text with symbol references replaced by links.
         */
        parseReferences(text: string): string;
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
declare module td {
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
declare module td {
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
declare module td {
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
declare module td {
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
        static buildToc(model: DeclarationReflection, trail: DeclarationReflection[], parent: NavigationItem): void;
    }
}
