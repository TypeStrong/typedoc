/// <reference path="../src/lib/tsd.d.ts" />
declare module TypeScript {
    var typescriptPath: string;
}
declare var Handlebars: HandlebarsStatic;
declare var Marked: MarkedStatic;
declare var HighlightJS: any;
declare var Minimatch: any;
declare var Util: any;
declare var VM: any;
declare var Path: any;
declare var FS: any;
declare var typeScriptPath: any;
declare module TypeScript {
    class SourceFile {
        public scriptSnapshot: IScriptSnapshot;
        public byteOrderMark: ByteOrderMark;
        constructor(scriptSnapshot: IScriptSnapshot, byteOrderMark: ByteOrderMark);
    }
    class DiagnosticsLogger implements ILogger {
        public ioHost: IIO;
        constructor(ioHost: IIO);
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
    class FileLogger implements ILogger {
        public ioHost: IIO;
        public fileName: string;
        constructor(ioHost: IIO);
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
    class BatchCompiler implements IReferenceResolverHost {
        public ioHost: IIO;
        public compilerVersion: string;
        public inputFiles: string[];
        public compilationSettings: ImmutableCompilationSettings;
        public resolvedFiles: IResolvedFile[];
        public fileNameToSourceFile: StringHashTable<SourceFile>;
        public hasErrors: boolean;
        public logger: ILogger;
        constructor(ioHost: IIO);
        public batchCompile(): void;
        public resolve(): void;
        public compile(): void;
        public parseOptions(): boolean;
        public setLocale(locale: string): boolean;
        public setLanguageAndTerritory(language: string, territory: string): boolean;
        public watchFiles(): void;
        public getSourceFile(fileName: string): SourceFile;
        public getDefaultLibraryFilePath(): string;
        public getScriptSnapshot(fileName: string): IScriptSnapshot;
        public resolveRelativePath(path: string, directory: string): string;
        public fileExistsCache: IIndexable<boolean>;
        public fileExists(path: string): boolean;
        public getParentDirectory(path: string): string;
        public addDiagnostic(diagnostic: Diagnostic): void;
        public tryWriteOutputFiles(outputFiles: OutputFile[]): boolean;
        public writeFile(fileName: string, contents: string, writeByteOrderMark: boolean): void;
        public directoryExists(path: string): boolean;
        public resolvePathCache: IIndexable<string>;
        public resolvePath(path: string): string;
    }
}
declare module TypeDoc {
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
        public isPropagationStopped: boolean;
        /**
        * Has [[Event.preventDefault]] been called?
        */
        public isDefaultPrevented: boolean;
        /**
        * Stop the propagation of this event. Remaining event handlers will not be executed.
        */
        public stopPropagation(): void;
        /**
        * Prevent the default action associated with this event from being executed.
        */
        public preventDefault(): void;
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
        public dispatch(event: string, ...args: any[]): void;
        /**
        * Register an event handler for the given event name.
        *
        * @param event     The name of the event the handler should be registered to.
        * @param handler   The callback that should be invoked.
        * @param scope     The scope the callback should be executed in.
        * @param priority  A numeric value describing the priority of the handler. Handlers
        *                  with higher priority will be executed earlier.
        */
        public on(event: string, handler: Function, scope?: any, priority?: number): void;
        /**
        * Remove an event handler.
        *
        * @param event    The name of the event whose handlers should be removed.
        * @param handler  The callback that should be removed.
        * @param scope    The scope of the callback that should be removed.
        */
        public off(event?: string, handler?: Function, scope?: any): void;
    }
}
declare module TypeDoc {
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
    /**
    * An interface of the application class.
    *
    * All classes should expect this interface allowing other third parties
    * to use their own implementation.
    */
    interface IApplication {
        /**
        * The settings used by the dispatcher and the renderer.
        */
        settings: Settings;
        /**
        * Print a log message.
        *
        * @param message  The message itself.
        * @param level  The urgency of the log message.
        */
        log(message: string, level?: LogLevel): void;
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
    class Application implements IApplication {
        /**
        * The settings used by the dispatcher and the renderer.
        */
        public settings: Settings;
        /**
        * The dispatcher used to create the declaration reflections.
        */
        public dispatcher: Factories.Dispatcher;
        /**
        * The renderer used to generate the documentation output.
        */
        public renderer: Output.Renderer;
        /**
        * Has an error been raised through the log method?
        */
        public hasErrors: boolean;
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
        public runFromCommandline(): void;
        /**
        * Print a log message.
        *
        * @param message  The message itself.
        * @param level    The urgency of the log message.
        */
        public log(message: string, level?: LogLevel): void;
        /**
        * Run the documentation generator for the given set of files.
        *
        * @param inputFiles  A list of source files whose documentation should be generated.
        * @param outputDirectory  The path of the directory the documentation should be written to.
        */
        public generate(inputFiles: string[], outputDirectory: string): void;
    }
}
declare module TypeDoc {
    /**
    * Holds all settings used by TypeDoc.
    */
    class Settings {
        /**
        * The settings used by the TypeScript compiler.
        */
        public compiler: TypeScript.CompilationSettings;
        /**
        * The list of source files that should be processed.
        */
        public inputFiles: string[];
        /**
        * The path of the output directory.
        */
        public outputDirectory: string;
        /**
        * The path of the theme that should be used.
        */
        public theme: string;
        /**
        * The human readable name of the project. Used within the templates to set the title of the document.
        */
        public name: string;
        /**
        * A pattern for files that should be excluded when a path is specified as source.
        */
        public excludePattern: string;
        /**
        * Should declaration files be documented?
        */
        public includeDeclarations: boolean;
        /**
        * Should externally resolved TypeScript files be ignored?
        */
        public excludeExternals: boolean;
        /**
        * Define a pattern for files that should be considered being external.
        */
        public externalPattern: string;
        /**
        * Does the user want to display the help message?
        */
        public needsHelp: boolean;
        /**
        * Does the user want to know the version number?
        */
        public shouldPrintVersionOnly: boolean;
        /**
        * Should verbose messages be printed?
        */
        public verbose: boolean;
        /**
        * Create a new Settings instance.
        */
        constructor();
        /**
        * Read the settings from command line arguments.
        */
        public readFromCommandline(application: IApplication): boolean;
        /**
        * Expand the list of input files.
        *
        * Searches for directories in the input files list and replaces them with a
        * listing of all TypeScript files within them. One may use the ```--excludePattern``` option
        * to filter out files with a pattern.
        */
        public expandInputFiles(): void;
        /**
        * Create and initialize an instance of OptionsParser to read command line arguments.
        *
        * This function partially contains the options found in [[TypeScript.BatchCompiler.parseOptions]].
        * When updating the TypeScript compiler, new options should be copied over here.
        *
        * @returns An initialized OptionsParser instance.
        */
        private createOptionsParser();
    }
}
declare module TypeDoc.Factories {
    /**
    * Base class of all handlers.
    */
    class BaseHandler {
        /**
        * The dispatcher this handler is attached to.
        */
        public dispatcher: Dispatcher;
        /**
        * Create a new BaseHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
    }
}
declare module TypeDoc.Factories {
    class BasePath {
        public basePath: string;
        public add(fileName: string): void;
        public trim(fileName: string): string;
        public reset(): void;
        static normalize(path: string): string;
    }
}
declare module TypeDoc.Factories {
    interface IScriptSnapshot {
        getText(start: number, end: number): string;
        getLineNumber(position: number): number;
    }
    /**
    *
    */
    class Compiler extends TypeScript.BatchCompiler {
        public idMap: {
            [id: number]: Models.DeclarationReflection;
        };
        private snapshots;
        /**
        * Create a new compiler instance.
        */
        constructor(settings: TypeScript.CompilationSettings, inputFiles: string[]);
        public run(): TypeScript.Document[];
        public compile(): TypeScript.Document[];
        /**
        * Return the snapshot of the given filename.
        *
        * @param fileName  The filename of the snapshot.
        */
        public getSnapshot(fileName: string): IScriptSnapshot;
        public getDefaultLibraryFilePath(): string;
    }
}
declare module TypeDoc.Factories {
    /**
    * The dispatcher receives documents from the compiler and emits
    * events for all discovered declarations.
    *
    * [[BaseHandler]] instances are the actual workhorses behind the dispatcher. They listen
    * to the events emitted by the dispatcher and populate the generated [[BaseReflection]]
    * instances. Each event contains a [[BaseState]] instance describing the current state the
    * dispatcher is in. Handlers can alter the state or stop it from being further processed.
    *
    * For each document (a single *.ts file) the dispatcher will generate the following event flow.
    * Declarations are processed according to their hierarchy.
    *
    *  * [[Dispatcher.EVENT_BEGIN]]<br>
    *    Triggered when the dispatcher starts processing a project. The listener receives
    *    an instance of [[DispatcherEvent]]. By calling [[DispatcherEvent.preventDefault]] the
    *    project file will not be processed.
    *
    *  * [[Dispatcher.EVENT_BEGIN_DOCUMENT]]<br>
    *    Triggered when the dispatcher starts processing a TypeScript document. The listener receives
    *    an instance of [[DocumentState]]. By calling [[DocumentState.preventDefault]] the entire
    *    TypeScript file will be ignored.
    *
    *    * [[Dispatcher.EVENT_BEGIN_DECLARATION]]<br>
    *      Triggered when the dispatcher starts processing a declaration. The listener receives
    *      an instance of [[DeclarationState]]. The [[DeclarationState.reflection]] property of
    *      the state is undefined at this moment. By calling [[DeclarationState.preventDefault]]
    *      the declaration will be skipped.
    *
    *      * [[Dispatcher.EVENT_CREATE_REFLECTION]]<br>
    *        Triggered when the dispatcher creates a new reflection instance. The listener receives
    *        an instance of [[DeclarationState]]. The [[DeclarationState.reflection]] property of
    *        the state contains a newly created [[DeclarationReflection]] instance.
    *
    *      * [[Dispatcher.EVENT_MERGE_REFLECTION]]<br>
    *        Triggered when the dispatcher merges an existing reflection with a new declaration.
    *        The listener receives an instance of [[DeclarationState]]. The
    *        [[DeclarationState.reflection]] property of the state contains the persistent
    *        [[DeclarationReflection]] instance.
    *
    *    * [[Dispatcher.EVENT_DECLARATION]]<br>
    *      Triggered when the dispatcher processes a declaration. The listener receives an instance
    *      of [[DeclarationState]].
    *
    *    * [[Dispatcher.EVENT_END_DECLARATION]]<br>
    *      Triggered when the dispatcher has finished processing a declaration. The listener receives
    *      an instance of [[DeclarationState]].
    *
    *  * [[Dispatcher.EVENT_END_DOCUMENT]]<br>
    *    Triggered when the dispatcher has finished processing a TypeScript document. The listener
    *    receives an instance of [[DocumentState]].
    *
    *
    *  After the dispatcher has processed all documents, it will enter the resolving phase and
    *  trigger the following event flow.
    *
    *  * [[Dispatcher.EVENT_BEGIN_RESOLVE]]<br>
    *    Triggered when the dispatcher enters the resolving phase. The listener receives an instance
    *    of [[DispatcherEvent]].
    *
    *    * [[Dispatcher.EVENT_RESOLVE]]<br>
    *      Triggered when the dispatcher resolves a reflection. The listener receives an instance
    *      of [[ReflectionEvent]].
    *
    *  * [[Dispatcher.EVENT_END_RESOLVE]]<br>
    *    Triggered when the dispatcher leaves the resolving phase. The listener receives an instance
    *    of [[DispatcherEvent]].
    */
    class Dispatcher extends EventDispatcher {
        /**
        * The application this dispatcher is attached to.
        */
        public application: IApplication;
        /**
        * List of all handlers that are attached to the renderer.
        */
        public handlers: any[];
        /**
        * Triggered once per project before the dispatcher invokes the compiler.
        * @event
        */
        static EVENT_BEGIN: string;
        /**
        * Triggered when the dispatcher starts processing a TypeScript document.
        * @event
        */
        static EVENT_BEGIN_DOCUMENT: string;
        /**
        * Triggered when the dispatcher has finished processing a TypeScript document.
        * @event
        */
        static EVENT_END_DOCUMENT: string;
        /**
        * Triggered when the dispatcher creates a new reflection instance.
        * @event
        */
        static EVENT_CREATE_REFLECTION: string;
        /**
        * Triggered when the dispatcher merges an existing reflection with a new declaration.
        * @event
        */
        static EVENT_MERGE_REFLECTION: string;
        /**
        * Triggered when the dispatcher starts processing a declaration.
        * @event
        */
        static EVENT_BEGIN_DECLARATION: string;
        /**
        * Triggered when the dispatcher processes a declaration.
        * @event
        */
        static EVENT_DECLARATION: string;
        /**
        * Triggered when the dispatcher has finished processing a declaration.
        * @event
        */
        static EVENT_END_DECLARATION: string;
        /**
        * Triggered when the dispatcher enters the resolving phase.
        * @event
        */
        static EVENT_BEGIN_RESOLVE: string;
        /**
        * Triggered when the dispatcher resolves a reflection.
        * @event
        */
        static EVENT_RESOLVE: string;
        /**
        * Triggered when the dispatcher leaves the resolving phase.
        * @event
        */
        static EVENT_END_RESOLVE: string;
        /**
        * Registry containing the handlers, that should be created by default.
        */
        static HANDLERS: any[];
        /**
        * Create a new Dispatcher instance.
        *
        * @param application  The application this dispatcher is attached to.
        */
        constructor(application: IApplication);
        /**
        * Compile the given list of source files and generate a reflection for them.
        *
        * @param inputFiles  A list of source files.
        * @returns The generated root reflection.
        */
        public createProject(inputFiles: string[]): Models.ProjectReflection;
        /**
        * Run the compiler.
        *
        * @param event  The event containing the project and compiler.
        */
        private compile(event);
        /**
        * Resolve all created reflections.
        *
        * @param event  The event containing the project and compiler.
        */
        private resolve(event);
        /**
        * Process the given state.
        *
        * @param state  The state that should be processed.
        */
        public processState(state: DeclarationState): void;
        /**
        * Ensure that the given state holds a reflection.
        *
        * Reflections should always be created through this function as the dispatcher
        * will hold an array of created reflections for the final resolving phase.
        *
        * @param state  The state the reflection should be created for.
        * @return       TRUE if a new reflection has been created, FALSE if the
        *               state already holds a reflection.
        */
        public ensureReflection(state: DeclarationState): boolean;
        /**
        * Print debug information of the given declaration to the console.
        *
        * @param declaration  The declaration that should be printed.
        * @param indent  Used internally to indent child declarations.
        */
        static explainDeclaration(declaration: TypeScript.PullDecl, indent?: string): void;
        /**
        * Return a string that explains the given flag bit mask.
        *
        * @param flags  A bit mask containing TypeScript.PullElementFlags bits.
        * @returns A string describing the given bit mask.
        */
        static flagsToString(flags: any): string;
    }
}
declare module TypeDoc.Factories {
    /**
    * Event object dispatched by [[Dispatcher]].
    *
    * This event is used when the dispatcher is not processing a specific declaration but
    * when a certain state is reached.
    *
    * @see [[Dispatcher.EVENT_BEGIN]]
    * @see [[Dispatcher.EVENT_BEGIN_RESOLVE]]
    * @see [[Dispatcher.EVENT_END_RESOLVE]]
    */
    class DispatcherEvent extends Event {
        /**
        * The dispatcher that has created this event.
        */
        public dispatcher: Dispatcher;
        /**
        * The current compiler used by the dispatcher.
        */
        public compiler: Compiler;
        /**
        * The project the reflections are written to.
        */
        public project: Models.ProjectReflection;
        /**
        * Create a new DispatcherEvent instance.
        *
        * @param dispatcher  The dispatcher that has created this event.
        * @param compiler    The current compiler used by the dispatcher.
        * @param project     The project the reflections are written to.
        */
        constructor(dispatcher: Dispatcher, compiler: Compiler, project: Models.ProjectReflection);
        /**
        * Create a [[ReflectionEvent]] based on this event and the given reflection.
        *
        * @param reflection  The reflection the returned event should represent.
        * @returns           A newly created instance of [[ReflectionEvent]].
        */
        public createReflectionEvent(reflection: Models.DeclarationReflection): ReflectionEvent;
        /**
        * Create a [[DocumentState]] based on this event and the given document.
        *
        * @param document  The document the returned state should represent.
        * @returns         A newly created instance of [[DocumentState]].
        */
        public createDocumentState(document: TypeScript.Document): DocumentState;
    }
}
declare module TypeDoc.Factories {
    /**
    * Base class of all state events.
    *
    * States store the current declaration and its matching reflection while
    * being processed by the [[Dispatcher]]. [[BaseHandler]] instances can alter the state and
    * stop it from being further processed.
    *
    * For each child declaration the dispatcher will create a child [[DeclarationState]]
    * state. The root state is always an instance of [[DocumentState]].
    */
    class BaseState extends DispatcherEvent {
        /**
        * The parent state of this state.
        */
        public parentState: BaseState;
        /**
        * The TypeScript declaration that should be reflected by this state.
        */
        public declaration: TypeScript.PullDecl;
        /**
        * The TypeScript declaration that should be reflected by this state.
        */
        public originalDeclaration: TypeScript.PullDecl;
        /**
        * The reflection created for the declaration of this state.
        */
        public reflection: Models.BaseReflection;
        /**
        * Is this a declaration from an external document?
        */
        public isExternal: boolean;
        /**
        * Create a new BaseState instance.
        */
        constructor(parent: DispatcherEvent, declaration: TypeScript.PullDecl, reflection?: Models.BaseReflection);
        /**
        * Check whether the given flag is set on the declaration of this state.
        *
        * @param flag   The flag that should be looked for.
        */
        public hasFlag(flag: number): boolean;
        /**
        * @param kind  The kind to test for.
        * @param useOriginalDeclaration  Should the kind of the original declaration be checked?
        */
        public kindOf(kind: TypeScript.PullElementKind, useOriginalDeclaration?: boolean): boolean;
        /**
        * @param kind  An array of kinds to test for.
        * @param useOriginalDeclaration  Should the kind of the original declaration be checked?
        */
        public kindOf(kind: TypeScript.PullElementKind[], useOriginalDeclaration?: boolean): boolean;
        public getName(): string;
        /**
        * Return the root state of this state.
        *
        * The root state is always an instance of {DocumentState}.
        */
        public getDocumentState(): DocumentState;
        /**
        * Return the snapshot of the given filename.
        *
        * @param fileName  The filename of the snapshot.
        */
        public getSnapshot(fileName: string): IScriptSnapshot;
        /**
        * Create a child state of this state with the given declaration.
        *
        * This state must hold an reflection when creating a child state, an error will
        * be thrown otherwise. If the reflection of this state contains a child with
        * the name of the given declaration, the reflection of the child state will be
        * populated with it.
        *
        * @param declaration  The declaration that is encapsulated by the child state.
        */
        public createChildState(declaration: TypeScript.PullDecl): DeclarationState;
        static getName(declaration: TypeScript.PullDecl): string;
    }
}
declare module TypeDoc.Factories {
    /**
    */
    class DeclarationState extends BaseState {
        public reflection: Models.DeclarationReflection;
        public flattenedName: string;
        public isSignature: boolean;
        public isInherited: boolean;
        public isFlattened: boolean;
        /**
        * @inherit
        */
        public createChildState(declaration: TypeScript.PullDecl): DeclarationState;
        /**
        * Create a child state of this state with the given declaration.
        */
        public createSignatureState(): DeclarationState;
        public createInheritanceState(declaration: TypeScript.PullDecl): DeclarationState;
    }
}
declare module TypeDoc.Factories {
    /**
    * Root state containing the TypeScript document that is processed.
    */
    class DocumentState extends BaseState {
        /**
        * The TypeScript document all following declarations are derived from.
        */
        public document: TypeScript.Document;
        /**
        * Create a new DocumentState instance.
        *
        * @param parent    The parent dispatcher event.
        * @param document  The TypeScript document that is being processed.
        */
        constructor(parent: DispatcherEvent, document: TypeScript.Document);
    }
}
declare module TypeDoc.Factories {
    /**
    * Event object dispatched by [[Dispatcher]] during the resolving phase.
    *
    * @see [[Dispatcher.EVENT_RESOLVE]]
    */
    class ReflectionEvent extends DispatcherEvent {
        /**
        * The final reflection that should be resolved.
        */
        public reflection: Models.DeclarationReflection;
        /**
        * Create a new ReflectionEvent instance.
        *
        * @param parent    The parent dispatcher event.
        * @param reflection  The final reflection that should be resolved.
        */
        constructor(parent: DispatcherEvent, reflection?: Models.DeclarationReflection);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that analyzes the AST and extracts data not represented by declarations.
    */
    class AstHandler extends BaseHandler {
        /**
        * The ast walker factory.
        */
        private factory;
        /**
        * Collected ambient module export data.
        */
        private exports;
        /**
        * Create a new AstHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered once per project before the dispatcher invokes the compiler.
        *
        * @param event  An event object containing the related project and compiler instance.
        */
        private onBegin(event);
        /**
        * Triggered when the dispatcher starts processing a declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDeclaration(state);
        /**
        * Try to find the identifier of the export assignment within the given declaration.
        *
        * @param declaration  The declaration whose export assignment should be resolved.
        * @returns            The found identifier or NULL.
        */
        public getExportedIdentifier(declaration: TypeScript.PullDecl): TypeScript.Identifier;
        /**
        * Try to find the compiler symbol exported by the given declaration.
        *
        * @param declaration  The declaration whose export assignment should be resolved.
        * @returns            The found compiler symbol or NULL.
        */
        public getExportedSymbol(declaration: TypeScript.PullDecl): TypeScript.PullSymbol;
        /**
        * Mark the given reflection and all of its children as being exported.
        *
        * @param reflection  The reflection that should be marked as being exported.
        */
        static markAsExported(reflection: Models.DeclarationReflection): void;
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
    * the generated reflections.
    */
    class CommentHandler extends BaseHandler {
        /**
        * Create a new CommentHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher processes a declaration.
        *
        * Invokes the comment parser.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onDeclaration(state);
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
        * Test whether the given TypeScript comment instance is a doc comment.
        *
        * @param comment  The TypeScript comment that should be tested.
        * @returns        True when the comment is a doc comment, otherwise false.
        */
        static isDocComment(comment: TypeScript.Comment): boolean;
        /**
        * Remove all tags with the given name from the given comment instance.
        *
        * @param comment  The comment that should be modified.
        * @param tagName  The name of the that that should be removed.
        */
        static removeTags(comment: Models.Comment, tagName: string): void;
        /**
        * Find all doc comments associated with the declaration of the given state
        * and return their plain text.
        *
        * Variable declarations need a special treatment, their comments are stored with the
        * surrounding VariableStatement ast element. Their ast hierarchy looks like this:
        * > VariableStatement &#8594; VariableDeclaration &#8594; SeparatedList &#8594; VariableDeclarator
        *
        * This reflect the possibility of JavaScript to define multiple variables with a single ```var```
        * statement. We therefore have to check whether the VariableStatement contains only one variable
        * and then can assign the comment of the VariableStatement to the VariableDeclarator declaration.
        *
        * @param state  The state containing the declaration whose comments should be extracted.
        * @returns A list of all doc comments associated with the state.
        */
        static findComments(state: DeclarationState): string[];
        /**
        * Parse the given doc comment string.
        *
        * @param text     The doc comment string that should be parsed.
        * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
        * @returns        A populated [[Models.Comment]] instance.
        */
        static parseDocComment(text: string, comment?: Models.Comment): Models.Comment;
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that truncates the names of dynamic modules to not include the
    * project's base path.
    */
    class DynamicModuleHandler extends BaseHandler {
        /**
        * Helper class for determining the base path.
        */
        private basePath;
        /**
        * List of reflections whose name must be trimmed.
        */
        private reflections;
        /**
        * The declaration kinds affected by this handler.
        */
        private affectedKinds;
        /**
        * Create a new DynamicModuleHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
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
        private onDeclaration(state);
        /**
        * Triggered when the dispatcher enters the resolving phase.
        *
        * @param event  The event containing the reflection to resolve.
        */
        private onBeginResolve(event);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that marks files not passed as source files as being external.
    */
    class ExternalHandler extends BaseHandler {
        /**
        * An array of normalized input file names.
        */
        public inputFiles: string[];
        /**
        * Should externally resolved TypeScript files be ignored?
        */
        public exclude: boolean;
        /**
        * Compiled pattern for files that should be considered being external.
        */
        public pattern: any;
        /**
        * Create a new ExternalHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered once per project before the dispatcher invokes the compiler.
        *
        * @param event  An event object containing the related project and compiler instance.
        */
        private onBegin(event);
        /**
        * Triggered when the dispatcher starts processing a TypeScript document.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDocument(state);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that reflections for function types.
    */
    class FunctionTypeHandler extends BaseHandler {
        /**
        * Create a new FunctionTypeHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher processes a declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onDeclaration(state);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that sorts and groups the found reflections in the resolving phase.
    *
    * The handler sets the ´groups´ property of all reflections.
    */
    class GroupHandler extends BaseHandler {
        /**
        * Define the sort order of reflections.
        */
        static WEIGHTS: TypeScript.PullElementKind[];
        /**
        * Define the singular name of individual reflection kinds.
        */
        static SINGULARS: {};
        /**
        * Define the plural name of individual reflection kinds.
        */
        static PLURALS: {};
        /**
        * Create a new GroupHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
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
        static getReflectionGroups(reflections: Models.DeclarationReflection[]): Models.ReflectionGroup[];
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
        static getKindSingular(kind: TypeScript.PullElementKind): string;
        /**
        * Return the plural name of a internal typescript kind identifier.
        *
        * @param kind The original internal typescript kind identifier.
        * @returns The plural name of the given internal typescript kind identifier
        */
        static getKindPlural(kind: TypeScript.PullElementKind): string;
        /**
        * Callback used to sort reflections by weight defined by ´GroupHandler.WEIGHTS´ and name.
        *
        * @param a The left reflection to sort.
        * @param b The right reflection to sort.
        * @returns The sorting weight.
        */
        static sortCallback(a: Models.DeclarationReflection, b: Models.DeclarationReflection): number;
    }
}
declare module TypeDoc.Factories {
    class InheritanceHandler extends BaseHandler {
        /**
        * Create a new InheritanceHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher creates a new reflection instance.
        *
        * Sets [[DeclarationReflection.inheritedFrom]] on inherited members.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onCreateReflection(state);
        /**
        * Triggered when the dispatcher merges an existing reflection with a new declaration.
        *
        * Sets [[DeclarationReflection.overwrites]] on overwritten members.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onMergeReflection(state);
        /**
        * Triggered when the dispatcher starts processing a declaration.
        *
        * Prevents private and static members from being inherited.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDeclaration(state);
        /**
        * Triggered when the dispatcher has finished processing a declaration.
        *
        * Emits an additional [[DeclarationState]] for each extended type on the current
        * reflection.
        *
        * Sets [[DeclarationReflection.extendedBy]] and [[DeclarationReflection.extendedTypes]].
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onEndDeclaration(state);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that filters declarations that should be ignored and prevents
    * the creation of reflections for them.
    *
    * TypeDoc currently ignores all type aliases, object literals, object types and
    * implicit variables. Furthermore declaration files are ignored.
    */
    class NullHandler extends BaseHandler {
        /**
        * Should declaration files be documented?
        */
        private includeDeclarations;
        /**
        * An array of all declaration kinds that should be ignored.
        */
        private ignoredKinds;
        /**
        * Create a new NullHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered once per project before the dispatcher invokes the compiler.
        *
        * @param event  An event object containing the related project and compiler instance.
        */
        private onBegin(event);
        /**
        * Triggered when the dispatcher starts processing a TypeScript document.
        *
        * Prevents `lib.d.ts` from being processed.
        * Prevents declaration files from being processed depending on [[Settings.excludeDeclarations]].
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDocument(state);
        /**
        * Triggered when the dispatcher starts processing a declaration.
        *
        * Ignores all type aliases, object literals and types.
        * Ignores all implicit variables.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDeclaration(state);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that reflects object literals defined as variables.
    */
    class ObjectLiteralHandler extends BaseHandler {
        /**
        * Create a new ObjectLiteralHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher starts processing a declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onDeclaration(state);
        static getLiteralDeclaration(declaration: TypeScript.PullDecl): TypeScript.PullDecl;
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that tries to find the package.json and readme.md files of the
    * current project.
    *
    * The handler traverses the file tree upwards for each file processed by the processor
    * and records the nearest package info files it can find. Within the resolve files, the
    * contents of the found files will be read and appended to the ProjectReflection.
    */
    class PackageHandler extends BaseHandler {
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
        * Create a new PackageHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
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
        private onBeginDocument(state);
        /**
        * Triggered when the dispatcher enters the resolving phase.
        *
        * @param event  The event containing the project and compiler.
        */
        private onBeginResolve(event);
    }
}
declare module TypeDoc.Factories {
    interface IReflectionHandlerMergeStrategy {
        reflection?: TypeScript.PullElementKind[];
        declaration?: TypeScript.PullElementKind[];
        actions: Function[];
    }
    /**
    * A handler that sets the most basic reflection properties.
    */
    class ReflectionHandler extends BaseHandler {
        /**
        * A list of fags that should be exported to the flagsArray property.
        */
        static RELEVANT_FLAGS: TypeScript.PullElementFlags[];
        /**
        * A list of fags that should be exported to the flagsArray property for parameter reflections.
        */
        static RELEVANT_PARAMETER_FLAGS: TypeScript.PullElementFlags[];
        /**
        * A weighted list of element kinds used by [[mergeKinds]] to determine the importance of kinds.
        */
        static KIND_WEIGHTS: TypeScript.PullElementKind[];
        /**
        * A weighted list of element kinds used by [[mergeKinds]] to determine the importance of kinds.
        */
        static KIND_PROCESS_ORDER: TypeScript.PullElementKind[];
        static MERGE_STRATEGY: IReflectionHandlerMergeStrategy[];
        /**
        * Create a new ReflectionHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher creates a new reflection instance.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onCreateReflection(state);
        /**
        * Triggered when the dispatcher merges an existing reflection with a new declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onMergeReflection(state);
        /**
        * Triggered by the dispatcher for each reflection in the resolving phase.
        *
        * @param event  The event containing the reflection to resolve.
        */
        private onResolve(event);
        /**
        * Convert the reflection of the given state to a call signature.
        *
        * Applied when a function is merged with a container.
        *
        * @param state  The state whose reflection should be converted to a call signature.
        */
        static convertFunctionToCallSignature(state: DeclarationState): void;
        /**
        *
        * Applied when a container is merged with a variable.
        *
        * @param state
        */
        static implementVariableType(state: DeclarationState): void;
        /**
        * Sort the given list of declarations for being correctly processed.
        *
        * @param declarations  The list of declarations that should be processed.
        * @returns             The sorted list.
        */
        static sortDeclarations(declarations: TypeScript.PullDecl[]): TypeScript.PullDecl[];
        /**
        * Merge two kind definitions.
        *
        * @param left   The left kind to merge.
        * @param right  The right kind to merge.
        */
        static mergeKinds(left: TypeScript.PullElementKind, right: TypeScript.PullElementKind): TypeScript.PullElementKind;
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that allows a variable to be documented as being the type it is set to.
    *
    * Use the ``@resolve``  javadoc comment to trigger this handler. You can see an example
    * of this handler within the TypeDoc documentation. If you take a look at the [[Models.Kind]]
    * enumeration, it is documented as being a real enumeration, within the source code it is actually
    * just a reference to [[TypeScript.PullElementKind]].
    *
    * ```typescript
    * /**
    *  * @resolve
    *  * /
    * export var Kind = TypeScript.PullElementKind;
    * ```
    */
    class ResolveHandler extends BaseHandler {
        /**
        * Create a new ResolveHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher starts processing a declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDeclaration(state);
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that creates signature reflections.
    */
    class SignatureHandler extends BaseHandler {
        /**
        * The declaration kinds affected by this handler.
        */
        private affectedKinds;
        /**
        * Create a new SignatureHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered when the dispatcher starts processing a declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDeclaration(state);
        /**
        * Triggered when the dispatcher processes a declaration.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onDeclaration(state);
        /**
        * Tests whether the given state describes a method overwrite.
        *
        * @param state  The state that should be tested.
        * @returns      TRUE when the state is a method overwrite, otherwise FALSE.
        */
        static isMethodOverwrite(state: DeclarationState): boolean;
    }
}
declare module TypeDoc.Factories {
    /**
    * A handler that attaches source file information to reflections.
    */
    class SourceHandler extends BaseHandler {
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
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered once per project before the dispatcher invokes the compiler.
        *
        * @param event  An event object containing the related project and compiler instance.
        */
        private onBegin(event);
        /**
        * Triggered when the dispatcher starts processing a TypeScript document.
        *
        * Create a new [[SourceFile]] instance for all TypeScript files.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onBeginDocument(state);
        /**
        * Triggered when the dispatcher processes a declaration.
        *
        * Attach the current source file to the [[DeclarationReflection.sources]] array.
        *
        * @param state  The state that describes the current declaration and reflection.
        */
        private onDeclaration(state);
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
declare module TypeDoc.Factories {
    /**
    * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
    */
    class TypeHandler extends BaseHandler {
        /**
        * Map of created named types for reuse.
        */
        static stringConstantTypes: {
            [name: string]: Models.StringConstantType;
        };
        /**
        * Map of created named types for reuse.
        */
        static namedTypes: {
            [name: string]: Models.NamedType;
        };
        /**
        * Create a new TypeHandler instance.
        *
        * @param dispatcher  The dispatcher this handler should be attached to.
        */
        constructor(dispatcher: Dispatcher);
        /**
        * Triggered by the dispatcher for each reflection in the resolving phase.
        *
        * @param event  The event containing the reflection to resolve.
        */
        private onResolve(event);
        /**
        * Resolve the given array of types.
        *
        * This is a utility function which calls [[resolveType]] on all elements of the array.
        *
        * @param types     The array of types that should be resolved.
        * @param compiler  The compiler used by the dispatcher.
        * @returns         The given array with resolved types.
        */
        private resolveTypes(types, compiler);
        /**
        * Resolve the given type.
        *
        * Only instances of [[Models.LateResolvingType]] will be resolved. This function tries
        * to generate an instance of [[Models.ReflectionType]].
        *
        * @param type      The type that should be resolved.
        * @param compiler  The compiler used by the dispatcher.
        * @returns         The resolved type.
        */
        private resolveType(type, compiler);
        /**
        * Return the simplified type hierarchy for the given reflection.
        *
        * @TODO Type hierarchies for interfaces with multiple parent interfaces.
        *
        * @param reflection The reflection whose type hierarchy should be generated.
        * @returns The root of the generated type hierarchy.
        */
        static buildTypeHierarchy(reflection: Models.DeclarationReflection): Models.IDeclarationHierarchy;
        /**
        * Create a type instance for the given symbol.
        *
        * The following native TypeScript types are not supported:
        *  * TypeScript.PullErrorTypeSymbol
        *  * TypeScript.PullTypeAliasSymbol
        *  * TypeScript.PullTypeParameterSymbol
        *  * TypeScript.PullTypeSymbol
        *
        * @param symbol  The TypeScript symbol the type should point to.
        */
        static createType(symbol: TypeScript.PullTypeSymbol): Models.BaseType;
        /**
        * Create a string constant type. If the type has been created before, the existent type will be returned.
        *
        * @param name  The name of the type.
        * @returns     The type instance.
        */
        static createStringConstantType(name: string): Models.StringConstantType;
        /**
        * Create a named type. If the type has been created before, the existent type will be returned.
        *
        * @param name  The name of the type.
        * @returns     The type instance.
        */
        static createNamedType(name: string): Models.NamedType;
    }
}
declare module TypeDoc.Models {
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
        public shortText: string;
        /**
        * The full body text of the comment. Excludes the [[shortText]].
        */
        public text: string;
        /**
        * The text of the ```@returns``` tag if present.
        */
        public returns: string;
        /**
        * All associated javadoc tags.
        */
        public tags: CommentTag[];
        /**
        * Creates a new Comment instance.
        */
        constructor(shortText?: string, text?: string);
        /**
        * Test whether this comment contains a tag with the given name.
        *
        * @param tagName  The name of the tag to look for.
        * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
        */
        public hasTag(tagName: string): boolean;
        /**
        * Return the first tag with the given name.
        *
        * You can optionally pass a parameter name that should be searched to.
        *
        * @param tagName  The name of the tag to look for.
        * @param paramName  An optional parameter name to look for.
        * @returns The found tag or NULL.
        */
        public getTag(tagName: string, paramName?: string): CommentTag;
    }
}
declare module TypeDoc.Models {
    /**
    * A model that represents a single javadoc comment tag.
    *
    * Tags are stored in the [[Comment.tags]] property.
    */
    class CommentTag {
        /**
        * The name of this tag.
        */
        public tagName: string;
        /**
        * The name of the related parameter when this is a ```@param``` tag.
        */
        public paramName: string;
        /**
        * The actual body text of this tag.
        */
        public text: string;
        /**
        * Create a new CommentTag instance.
        */
        constructor(tagName: string, paramName?: string, text?: string);
    }
}
declare module TypeDoc.Models {
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
    class BaseReflection {
        /**
        * Unique id of this reflection.
        */
        public id: number;
        /**
        * The reflection this reflection is a child of.
        */
        public parent: BaseReflection;
        /**
        * The children of this reflection.
        */
        public children: DeclarationReflection[];
        /**
        * All children grouped by their kind.
        */
        public groups: ReflectionGroup[];
        /**
        * The symbol name of this reflection.
        */
        public name: string;
        /**
        * The parsed documentation comment attached to this reflection.
        */
        public comment: Comment;
        /**
        * The url of this reflection in the generated documentation.
        */
        public url: string;
        /**
        * The name of the anchor of this child.
        */
        public anchor: string;
        /**
        * Is the url pointing to an individual document?
        *
        * When FALSE, the url points to an anchor tag on a page of a different reflection.
        */
        public hasOwnDocument: boolean;
        /**
        * Is this a declaration from an external document?
        */
        public isExternal: boolean;
        /**
        * Url safe alias for this reflection.
        *
        * @see [[BaseReflection.getAlias]]
        */
        private alias;
        /**
        * Create a new BaseReflection instance.
        */
        constructor();
        /**
        * Return the full name of this reflection.
        *
        * The full name contains the name of this reflection and the names of all parent reflections.
        *
        * @param separator  Separator used to join the names of the reflections.
        * @returns The full name of this reflection.
        */
        public getFullName(separator?: string): string;
        /**
        * @param name  The name of the child to look for. Might contain a hierarchy.
        */
        public getChildByName(name: string): DeclarationReflection;
        /**
        * @param names  The name hierarchy of the child to look for.
        */
        public getChildByName(names: string[]): DeclarationReflection;
        /**
        * Return a list of all children of a certain kind.
        *
        * @param kind  The desired kind of children.
        * @returns     An array containing all children with the desired kind.
        */
        public getChildrenByKind(kind: TypeScript.PullElementKind): DeclarationReflection[];
        /**
        * Return an url safe alias for this reflection.
        */
        public getAlias(): string;
        /**
        * @param name  The name to look for. Might contain a hierarchy.
        */
        public findReflectionByName(name: string): DeclarationReflection;
        /**
        * @param names  The name hierarchy to look for.
        */
        public findReflectionByName(names: string[]): DeclarationReflection;
        /**
        * Return a string representation of this reflection.
        */
        public toString(): string;
        /**
        * Return a string representation of this reflection and all of its children.
        *
        * @param indent  Used internally to indent child reflections.
        */
        public toReflectionString(indent?: string): string;
    }
}
declare module TypeDoc.Models {
    /**
    * Alias to TypeScript.PullElementKind
    *
    * @resolve
    */
    var Kind: typeof TypeScript.PullElementKind;
    /**
    * Alias to TypeScript.PullElementFlags
    *
    * @resolve
    */
    var Flags: typeof TypeScript.PullElementFlags;
    /**
    * Stores hierarchical type data.
    *
    * @see [[DeclarationReflection.typeHierarchy]]
    */
    interface IDeclarationHierarchy {
        /**
        * The type represented by this node in the hierarchy.
        */
        type: BaseType;
        /**
        * A list of a children of this node.
        */
        children?: IDeclarationHierarchy[];
        /**
        * Is this the entry within the type hierarchy of the target type?
        */
        isTarget?: boolean;
    }
    /**
    * Represents references of reflections to their defining source files.
    *
    * @see [[DeclarationReflection.sources]]
    */
    interface IDeclarationSource {
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
    }
    /**
    * A reflection that represents a single declaration emitted by the TypeScript compiler.
    *
    * All parts of a project are represented by DeclarationReflection instances. The actual
    * kind of a reflection is stored in its ´kind´ member.
    */
    class DeclarationReflection extends BaseReflection {
        /**
        * The definition of the underlying symbol.
        *
        * This is a string representation of the declaration which can be used
        * in templates, when no other presentation of this declaration is available.
        */
        public definition: string;
        /**
        * A list of function signatures attached to this declaration.
        *
        * TypeDoc creates one declaration per function that may contain ore or more
        * signature reflections.
        */
        public signatures: DeclarationReflection[];
        /**
        * The type of the reflection.
        *
        * If the reflection represents a variable or a property, this is the value type.<br />
        * If the reflection represents a signature, this is the return type.
        */
        public type: BaseType;
        /**
        * A list of all types this reflection extends (e.g. the parent classes).
        */
        public extendedTypes: BaseType[];
        /**
        * A list of all types that extend this reflection (e.g. the subclasses).
        */
        public extendedBy: BaseType[];
        /**
        * A bitmask containing the flags of this reflection as returned by the compiler.
        */
        public flags: TypeScript.PullElementFlags;
        /**
        * An array representation of the flags bitmask, containing only the flags relevant for documentation.
        */
        public flagsArray: any;
        /**
        * The kind of this reflection as returned by the compiler.
        */
        public kind: TypeScript.PullElementKind;
        /**
        * The human readable string representation of the kind of this reflection.
        */
        public kindString: string;
        /**
        * A list of all source files that contributed to this reflection.
        */
        public sources: IDeclarationSource[];
        /**
        * The default value of this reflection.
        *
        * Applies to function parameters.
        */
        public defaultValue: string;
        /**
        * Whether this reflection is an optional component or not.
        *
        * Applies to function parameters and object members.
        */
        public isOptional: boolean;
        /**
        * Is this a private member?
        */
        public isPrivate: boolean;
        /**
        * Is this a static member?
        */
        public isStatic: boolean;
        /**
        * Is this member exported?
        */
        public isExported: boolean;
        /**
        * Contains a simplified representation of the type hierarchy suitable for being
        * rendered in templates.
        */
        public typeHierarchy: IDeclarationHierarchy;
        /**
        * A type that points to the reflection that has been overwritten by this reflection.
        *
        * Applies to interface and class members.
        */
        public overwrites: BaseType;
        /**
        * A type that points to the reflection this reflection has been inherited from.
        *
        * Applies to interface and class members.
        */
        public inheritedFrom: BaseType;
        /**
        * A list of generated css classes that should be applied to representations of this
        * reflection in the generated markup.
        */
        public cssClasses: string;
        /**
        * @param kind  The kind to test for.
        */
        public kindOf(kind: TypeScript.PullElementKind): boolean;
        /**
        * @param kind  An array of kinds to test for.
        */
        public kindOf(kind: TypeScript.PullElementKind[]): boolean;
        /**
        * Return a string representation of this reflection.
        */
        public toString(): string;
        /**
        * Return a string representation of this reflection and all of its children.
        *
        * @param indent  Used internally to indent child reflections.
        */
        public toReflectionString(indent?: string): string;
        /**
        * Return a string representation of the given value based upon the given enumeration.
        *
        * @param value        The value that contains the bit mask that should be explained.
        * @param enumeration  The enumeration the bits in the value correspond to.
        * @param separator    A string used to concat the found flags.
        * @returns            A string representation of the given value.
        */
        static flagsToString(value: number, enumeration: any, separator?: string): string;
    }
}
declare module TypeDoc.Models {
    /**
    * A reflection that represents the root of the project.
    *
    * The project reflection acts as a global index, one may receive all reflections
    * and source files of the processed project through this reflection.
    */
    class ProjectReflection extends BaseReflection {
        /**
        * A list of all reflections within the project.
        */
        public reflections: DeclarationReflection[];
        /**
        * The root directory of the project.
        */
        public directory: SourceDirectory;
        /**
        * A list of all source files within the project.
        */
        public files: SourceFile[];
        /**
        * The name of the project.
        *
        * The name can be passed as a commandline argument or it is read from the package info.
        */
        public name: string;
        /**
        * The contents of the readme.md file of the project when found.
        */
        public readme: string;
        /**
        * The parsed data of the package.json file of the project when found.
        */
        public packageInfo: any;
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
        public getReflectionsByKind(kind: TypeScript.PullElementKind): DeclarationReflection[];
        /**
        * @param name  The name to look for. Might contain a hierarchy.
        */
        public findReflectionByName(name: string): DeclarationReflection;
        /**
        * @param names  The name hierarchy to look for.
        */
        public findReflectionByName(names: string[]): DeclarationReflection;
    }
}
declare module TypeDoc.Models {
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
        public title: string;
        /**
        * The original typescript kind of the children of this group.
        */
        public kind: TypeScript.PullElementKind;
        /**
        * All reflections of this group.
        */
        public children: DeclarationReflection[];
        /**
        * A list of generated css classes that should be applied to representations of this
        * group in the generated markup.
        */
        public cssClasses: string;
        /**
        * Do all children of this group have a separate document?
        *
        * A bound representation of the ´ReflectionGroup.getAllChildrenHaveOwnDocument´
        * that can be used within templates.
        */
        public allChildrenHaveOwnDocument: Function;
        /**
        * Are all children inherited members?
        */
        public allChildrenAreInherited: boolean;
        /**
        * Are all children private members?
        */
        public allChildrenArePrivate: boolean;
        /**
        * Are all children external members?
        */
        public allChildrenAreExternal: boolean;
        /**
        * Are any children exported declarations?
        */
        public someChildrenAreExported: boolean;
        /**
        * Create a new ReflectionGroup instance.
        *
        * @param title The title of this group.
        * @param kind  The original typescript kind of the children of this group.
        */
        constructor(title: string, kind: TypeScript.PullElementKind);
        /**
        * Do all children of this group have a separate document?
        */
        private getAllChildrenHaveOwnDocument();
    }
}
declare module TypeDoc.Models {
    class SourceDirectory {
        public name: string;
        public dirName: string;
        public url: string;
        public parent: SourceDirectory;
        public directories: {
            [name: string]: SourceDirectory;
        };
        public files: SourceFile[];
        public groups: ReflectionGroup[];
        constructor(name?: string, parent?: SourceDirectory);
        public toString(indent?: string): string;
        public getAllReflections(): DeclarationReflection[];
    }
}
declare module TypeDoc.Models {
    class SourceFile {
        public name: string;
        public fileName: string;
        public url: string;
        public parent: SourceDirectory;
        public reflections: DeclarationReflection[];
        public groups: ReflectionGroup[];
        constructor(fileName: string);
    }
}
declare module TypeDoc.Models {
    class NavigationItem {
        public title: string;
        public url: string;
        public parent: NavigationItem;
        public children: NavigationItem[];
        public cssClasses: string;
        public isCurrent: boolean;
        public isInPath: boolean;
        public isPrimary: boolean;
        constructor(title?: string, url?: string, parent?: NavigationItem);
    }
}
declare module TypeDoc.Models {
    /**
    *
    */
    class UrlMapping {
        public url: string;
        public model: any;
        public template: string;
        constructor(url: string, model: any, template: string);
    }
}
declare module TypeDoc.Models {
    class BaseType {
        public toString(): string;
    }
}
declare module TypeDoc.Models {
    class LateResolvingType extends BaseType {
        public declaration: TypeScript.PullDecl;
        public symbol: TypeScript.PullTypeSymbol;
        constructor(declaration: TypeScript.PullDecl);
        constructor(symbol: TypeScript.PullTypeSymbol);
    }
}
declare module TypeDoc.Models {
    class NamedType extends BaseType {
        public name: string;
        constructor(name: string);
        public toString(): string;
    }
}
declare module TypeDoc.Models {
    class ReflectionType extends BaseType {
        public reflection: DeclarationReflection;
        public isArray: boolean;
        constructor(reflection: DeclarationReflection, isArray: boolean);
        public toString(): string;
    }
}
declare module TypeDoc.Models {
    class StringConstantType extends BaseType {
        public value: string;
        constructor(value: string);
        public toString(): string;
    }
}
declare module TypeDoc.Output {
    /**
    * Base class of all plugins that can be attached to the [[Renderer]].
    */
    class BasePlugin {
        /**
        * The renderer this plugin is attached to.
        */
        public renderer: Renderer;
        /**
        * Create a new BasePlugin instance.
        *
        * @param renderer  The renderer this plugin should be attached to.
        */
        constructor(renderer: Renderer);
    }
}
declare module TypeDoc.Output {
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
        public renderer: Renderer;
        /**
        * The base path of this theme.
        */
        public basePath: string;
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
        public isOutputDirectory(path: string): boolean;
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
        public getUrls(project: Models.ProjectReflection): Models.UrlMapping[];
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
        public getNavigation(project: Models.ProjectReflection): Models.NavigationItem;
    }
}
declare module TypeDoc.Output {
    /**
    * Defines a mapping of a [[Models.Kind]] to a template file.
    *
    * Used by [[DefaultTheme]] to map reflections to output files.
    */
    interface ITemplateMapping {
        /**
        * [[DeclarationReflection.kind]] this rule applies to.
        */
        kind: TypeScript.PullElementKind[];
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
        public isOutputDirectory(path: string): boolean;
        /**
        * Map the models of the given project to the desired output files.
        *
        * @param project  The project whose urls should be generated.
        * @returns        A list of [[UrlMapping]] instances defining which models
        *                 should be rendered to which files.
        */
        public getUrls(project: Models.ProjectReflection): Models.UrlMapping[];
        /**
        * Create a navigation structure for the given project.
        *
        * @param project  The project whose navigation should be generated.
        * @returns        The root navigation item.
        */
        public getNavigation(project: Models.ProjectReflection): Models.NavigationItem;
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
        static getUrl(reflection: Models.BaseReflection, relative?: Models.BaseReflection, separator?: string): string;
        /**
        * Return the template mapping fore the given reflection.
        *
        * @param reflection  The reflection whose mapping should be resolved.
        * @returns           The found mapping or NULL if no mapping could be found.
        */
        static getMapping(reflection: Models.DeclarationReflection): ITemplateMapping;
        /**
        * Build the navigation nodes for the given reflection.
        *
        * @param reflection  The reflection whose navigation node should be created.
        * @param parent      The parent navigation node.
        */
        static buildNavigation(reflection: Models.DeclarationReflection, parent: Models.NavigationItem): void;
        /**
        * Build the url for the the given reflection and all of its children.
        *
        * @param reflection  The reflection the url should be created for.
        * @param urls        The array the url should be appended to.
        * @returns           The altered urls array.
        */
        static buildUrls(reflection: Models.DeclarationReflection, urls: Models.UrlMapping[]): Models.UrlMapping[];
        /**
        * Generate an anchor url for the given reflection and all of its children.
        *
        * @param reflection  The reflection an anchor url should be created for.
        * @param container   The nearest reflection having an own document.
        */
        static applyAnchorUrl(reflection: Models.DeclarationReflection, container: Models.BaseReflection): void;
        /**
        * Generate the css classes for the given reflection and apply them to the
        * [[DeclarationReflection.cssClasses]] property.
        *
        * @param reflection  The reflection whose cssClasses property should be generated.
        */
        static applyReflectionClasses(reflection: Models.DeclarationReflection): void;
        /**
        * Generate the css classes for the given reflection group and apply them to the
        * [[ReflectionGroup.cssClasses]] property.
        *
        * @param group  The reflection group whose cssClasses property should be generated.
        */
        static applyGroupClasses(group: Models.ReflectionGroup): void;
        /**
        * Transform a space separated string into a string suitable to be used as a
        * css class, e.g. "constructor method" > "Constructor-method".
        */
        static toStyleClass(str: string): string;
    }
}
declare module TypeDoc.Output {
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
        public application: IApplication;
        /**
        * List of all plugins that are attached to the renderer.
        */
        public plugins: BasePlugin[];
        /**
        * The theme that is used to render the documentation.
        */
        public theme: BaseTheme;
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
        * Return the template with the given filename.
        *
        * Tries to find the file in the ´templates´ subdirectory of the current theme.
        * If it does not exist, TypeDoc tries to find the template in the default
        * theme templates subdirectory.
        *
        * @param fileName  The filename of the template that should be loaded.
        * @returns The compiled template or NULL if the file could not be found.
        */
        public getTemplate(fileName: string): IHandlebarTemplate;
        /**
        * Render the given project reflection to the specified output directory.
        *
        * @param project  The project that should be rendered.
        * @param outputDirectory  The path of the directory the documentation should be rendered to.
        */
        public render(project: Models.ProjectReflection, outputDirectory: string): void;
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
declare module TypeDoc.Output {
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
        public project: Models.ProjectReflection;
        /**
        * The path of the directory the documentation should be written to.
        */
        public outputDirectory: string;
        /**
        * A list of all pages that should be generated.
        *
        * This list can be altered during the [[Renderer.EVENT_BEGIN]] event.
        */
        public urls: Models.UrlMapping[];
        /**
        * Create an [[OutputPageEvent]] event based on this event and the given url mapping.
        *
        * @internal
        * @param mapping  The mapping that defines the generated [[OutputPageEvent]] state.
        * @returns A newly created [[OutputPageEvent]] instance.
        */
        public createPageEvent(mapping: Models.UrlMapping): OutputPageEvent;
    }
}
declare module TypeDoc.Output {
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
        public project: Models.ProjectReflection;
        /**
        * The filename the page will be written to.
        */
        public filename: string;
        /**
        * The url this page will be located at.
        */
        public url: string;
        /**
        * The model that should be rendered on this page.
        */
        public model: any;
        /**
        * The template that should be used to render this page.
        */
        public template: IHandlebarTemplate;
        /**
        * The name of the template that should be used to render this page.
        */
        public templateName: string;
        /**
        * The primary navigation structure of this page.
        */
        public navigation: Models.NavigationItem;
        /**
        * The secondary navigation structure of this page.
        */
        public secondary: Models.NavigationItem[];
        /**
        * The final html content of this page.
        *
        * Should be rendered by layout templates and can be modifies by plugins.
        */
        public contents: string;
    }
}
declare module TypeDoc.Output {
    /**
    * A plugin that copies the subdirectory ´assets´ from the current themes
    * source folder to the output directory.
    */
    class AssetsPlugin extends BasePlugin {
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
declare module TypeDoc.Output {
    /**
    * A plugin that exports an index of the project to a javascript file.
    *
    * The resulting javascript file can be used to build a simple search function.
    */
    class JavascriptIndexPlugin extends BasePlugin {
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
declare module TypeDoc.Output {
    /**
    * A plugin that wraps the generated output with a layout template.
    *
    * Currently only a default layout is supported. The layout must be stored
    * as ´layouts/default.hbs´ in the theme directory.
    */
    class LayoutPlugin extends BasePlugin {
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
declare module TypeDoc.Output {
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
    class MarkedPlugin extends BasePlugin {
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
        public getRelativeUrl(absolute: string): string;
        /**
        * Compress the given string by removing all newlines.
        *
        * @param text  The string that should be compressed.
        * @returns The string with all newlsines stripped.
        */
        public getCompact(text: string): string;
        /**
        * Insert word break tags ``<wbr>`` into the given string.
        *
        * Breaks the given string at ``_``, ``-`` and captial letters.
        *
        * @param str  The string that should be split.
        * @return     The original string containing ``<wbr>`` tags where possible.
        */
        public getWordBreaks(str: string): string;
        /**
        * Highlight the synatx of the given text using HighlightJS.
        *
        * @param text  The text taht should be highlightes.
        * @param lang  The language that should be used to highlight the string.
        * @return A html string with syntax highlighting.
        */
        public getHighlighted(text: string, lang?: string): string;
        /**
        * Parse the given markdown string and return the resulting html.
        *
        * @param text  The markdown string that should be parsed.
        * @returns The resulting html string.
        */
        public parseMarkdown(text: string): string;
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
        public parseReferences(text: string): string;
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
declare module TypeDoc.Output {
    /**
    * A plugin that exposes the navigation structure of the documentation
    * to the rendered templates.
    *
    * The navigation structure is generated using the current themes
    * [[BaseTheme.getNavigation]] function. This plugins takes care that the navigation
    * is updated and passed to the render context.
    */
    class NavigationPlugin extends BasePlugin {
        /**
        * The navigation structure generated by the current theme.
        */
        public navigation: Models.NavigationItem;
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
declare module TypeDoc.Output {
    /**
    * A plugin that loads all partials of the current theme.
    *
    * Partials must be placed in the ´partials´ subdirectory of the theme. The plugin first
    * loads the partials of the default theme and then the partials of the current theme.
    */
    class PartialsPlugin extends BasePlugin {
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
declare module TypeScript {
    interface IFindFileResult {
        fileInformation: FileInformation;
        path: string;
    }
    interface IFileWatcher {
        close(): void;
    }
    interface IIO {
        readFile(path: string, codepage: number): FileInformation;
        appendFile(path: string, contents: string): void;
        writeFile(path: string, contents: string, writeByteOrderMark: boolean): void;
        deleteFile(path: string): void;
        dir(path: string, re?: RegExp, options?: {
            recursive?: boolean;
        }): string[];
        fileExists(path: string): boolean;
        directoryExists(path: string): boolean;
        createDirectory(path: string): void;
        resolvePath(path: string): string;
        dirName(path: string): string;
        findFile(rootPath: string, partialFilePath: string): IFindFileResult;
        print(str: string): void;
        printLine(str: string): void;
        arguments: string[];
        stderr: ITextWriter;
        stdout: ITextWriter;
        watchFile(fileName: string, callback: (x: string) => void): IFileWatcher;
        run(source: string, fileName: string): void;
        getExecutingFilePath(): string;
        quit(exitCode?: number): void;
    }
    module IOUtils {
        function writeFileAndFolderStructure(ioHost: IIO, fileName: string, contents: string, writeByteOrderMark: boolean): void;
        function throwIOError(message: string, error: Error): void;
        function combine(prefix: string, suffix: string): string;
        class BufferedTextWriter implements ITextWriter {
            public writer: {
                Write: (str: string) => void;
                Close: () => void;
            };
            public capacity: number;
            public buffer: string;
            constructor(writer: {
                Write: (str: string) => void;
                Close: () => void;
            }, capacity?: number);
            public Write(str: string): void;
            public WriteLine(str: string): void;
            public Close(): void;
        }
    }
    var IO: IIO;
}
declare module TypeScript {
    interface IOptions {
        name?: string;
        flag?: boolean;
        short?: string;
        usage?: {
            locCode: string;
            args: string[];
        };
        set?: (s: string) => void;
        type?: string;
        experimental?: boolean;
    }
    class OptionsParser {
        public host: IIO;
        public version: string;
        private DEFAULT_SHORT_FLAG;
        private DEFAULT_LONG_FLAG;
        private printedVersion;
        private findOption(arg);
        public unnamed: string[];
        public options: IOptions[];
        constructor(host: IIO, version: string);
        public printUsage(): void;
        public printVersion(): void;
        public option(name: string, config: IOptions, short?: string): void;
        public flag(name: string, config: IOptions, short?: string): void;
        public parseString(argString: string): void;
        public parse(args: string[]): void;
    }
}
