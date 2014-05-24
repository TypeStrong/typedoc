/// <reference path="../src/lib/typescript/typescript.d.ts" />
/// <reference path="../src/lib/node/node.d.ts" />
declare module TypeScript {
    var typescriptPath: string;
}
declare var Handlebars: any;
declare var Marked: any;
declare var HighlightJS: any;
declare var VM: any;
declare var Path: any;
declare var FS: any;
declare var dirname: any;
declare var file: any;
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
declare module TypeScript {
    class SourceFile {
        public scriptSnapshot: IScriptSnapshot;
        public byteOrderMark: ByteOrderMark;
        constructor(scriptSnapshot: IScriptSnapshot, byteOrderMark: ByteOrderMark);
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
        private resolve();
        public compile(): void;
        public parseOptions(): boolean;
        public alterOptionsParser(opts: OptionsParser): void;
        public postOptionsParse(): boolean;
        private setLocale(locale);
        private setLanguageAndTerritory(language, territory);
        private watchFiles();
        public getSourceFile(fileName: string): SourceFile;
        public getDefaultLibraryFilePath(): string;
        public getScriptSnapshot(fileName: string): IScriptSnapshot;
        public resolveRelativePath(path: string, directory: string): string;
        private fileExistsCache;
        public fileExists(path: string): boolean;
        public getParentDirectory(path: string): string;
        public addDiagnostic(diagnostic: Diagnostic): void;
        private tryWriteOutputFiles(outputFiles);
        public writeFile(fileName: string, contents: string, writeByteOrderMark: boolean): void;
        public directoryExists(path: string): boolean;
        private resolvePathCache;
        public resolvePath(path: string): string;
    }
}
declare module TypeDoc {
    interface IListener {
        handler: Function;
        scope: any;
        priority: number;
    }
    interface IListenerRegistry {
        [event: string]: IListener[];
    }
    class Event {
        public isPropagationStopped: boolean;
        public isDefaultPrevented: boolean;
        public stopPropagation(): void;
        public preventDefault(): void;
    }
    class EventDispatcher {
        private listeners;
        public dispatch(event: string, ...args: any[]): void;
        public on(event: string, handler: Function, scope?: any, priority?: number): void;
        public off(event?: string, handler?: Function, scope?: any): void;
    }
}
declare module TypeDoc {
    class Application extends TypeScript.BatchCompiler {
        public project: Models.ProjectReflection;
        public renderer: Renderer.Renderer;
        constructor();
        public runFromCLI(): void;
        public alterOptionsParser(opts: TypeScript.OptionsParser): void;
        public postOptionsParse(): boolean;
        public compile(): void;
        public getDefaultLibraryFilePath(): string;
    }
}
declare module TypeDoc.Factories {
    class BasePath {
        public basePath: string;
        public add(fileName: string): void;
        public trim(fileName: string): string;
        static normalize(path: string): string;
    }
}
declare module TypeDoc.Factories {
    interface IScriptSnapshot {
        getText(start: number, end: number): string;
        getLineNumber(position: number): number;
    }
    /**
    * Create a type instance for the given symbol.
    *
    * @param symbol  The TypeScript symbol the type should point to.
    */
    function createType(symbol: TypeScript.PullTypeSymbol): Models.BaseType;
    /**
    * The central dispatcher receives documents from the compiler and emits
    * events for all discovered declarations.
    *
    * Factories should listen to the events emitted by the dispatcher. Each event
    * contains a state object describing the current state the dispatcher is in. Factories
    * can alter the state or stop it from being further processed.
    *
    * While the compiler is active, it passes documents to the dispatcher. Each document
    * will create an ´enterDocument´ event. By stopping the generated state, factories can
    * prevent entire documents from being processed.
    *
    * The dispatcher will iterate over all declarations and its children in the document
    * and yields a child state for them. For each of this states an ´enterDeclaration´ event
    * will be emitted. By stopping the child state, factories can prevent declarations from
    * being processed.
    *
    * - enterDocument
    *   - enterDeclaration
    *   - mergeReflection / createReflection
    *   - process
    *   - **Recursion**
    */
    class Dispatcher extends EventDispatcher {
        /**
        * The project instance this dispatcher should push the created reflections to.
        */
        public project: Models.ProjectReflection;
        public compiler: TypeScript.BatchCompiler;
        public idMap: {
            [id: number]: Models.DeclarationReflection;
        };
        public snapshots: {
            [fileName: string]: IScriptSnapshot;
        };
        /**
        * A list of known factories.
        */
        static FACTORIES: any[];
        /**
        * Create a new Dispatcher instance.
        *
        * @param project  The target project instance.
        */
        constructor(project: Models.ProjectReflection, compiler: TypeScript.BatchCompiler);
        /**
        * Return the snapshot of the given filename.
        *
        * @param fileName  The filename of the snapshot.
        */
        public getSnapshot(fileName: string): IScriptSnapshot;
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
        * Attach the given document to the project.
        *
        * This method is called by the compiler for each compiled document.
        *
        * @param document  The TypeScript document that should be processed by the dispatcher.
        */
        public attachDocument(document: TypeScript.Document): void;
        public resolve(): void;
    }
}
declare module TypeDoc.Factories {
    class CommentHandler {
        constructor(dispatcher: Dispatcher);
        private onProcess(state);
        private onResolveReflection(reflection);
        static postProcessSignatures(reflection: Models.DeclarationReflection): void;
        static findComments(state: DeclarationState): string[];
        static applyComments(state: DeclarationState): void;
        static isDocComment(comment: TypeScript.Comment): boolean;
        static removeCommentTags(comment: Models.Comment, tagName: string): void;
        static parseDocComment(text: string, comment?: Models.Comment): Models.Comment;
    }
}
declare module TypeDoc.Factories {
    class DynamicModuleHandler {
        private basePath;
        constructor(dispatcher: Dispatcher);
        private onProcess(state);
        private onResolveReflection(reflection);
    }
}
declare module TypeDoc.Factories {
    class GroupHandler {
        private dispatcher;
        static WEIGHTS: TypeScript.PullElementKind[];
        static SINGULARS: {};
        static PLURALS: {};
        constructor(dispatcher: Dispatcher);
        private onResolveReflection(reflection);
        public onLeaveResolve(): void;
        static getReflectionGroups(reflections: Models.DeclarationReflection[]): Models.ReflectionGroup[];
        static getKindString(kind: TypeScript.PullElementKind): string;
        static getKindSingular(kind: TypeScript.PullElementKind): string;
        static getKindPlural(kind: TypeScript.PullElementKind): string;
        static sortCallback(a: Models.DeclarationReflection, b: Models.DeclarationReflection): number;
    }
}
declare module TypeDoc.Factories {
    class InheritanceHandler {
        private dispatcher;
        constructor(dispatcher: Dispatcher);
        public onMergeReflection(state: DeclarationState): void;
        public onCreateReflection(state: DeclarationState): void;
        public onEnterDeclaration(state: DeclarationState): void;
        public onLeaveDeclaration(state: DeclarationState): void;
    }
}
declare module TypeDoc.Factories {
    /**
    * A factory that filters declarations that should be ignored and prevents
    * the creation of reflections for them.
    *
    * TypeDoc currently ignores all type aliases, object literals, object types and
    * implicit variables. Furthermore declaration files are ignored.
    */
    class NullHandler {
        constructor(dispatcher: Dispatcher);
        public onEnterDocument(state: DocumentState): void;
        public onEnterDeclaration(state: DeclarationState): void;
    }
}
declare module TypeDoc.Factories {
    /**
    * A factory that copies basic values from declarations to reflections.
    *
    * This factory sets the following values on reflection models:
    *  - flags
    *  - kind
    *  - type
    *  - definition
    *  - isOptional
    *  - defaultValue
    */
    class ReflectionHandler {
        private dispatcher;
        constructor(dispatcher: Dispatcher);
        private onCreateReflection(state);
        private onMergeReflection(state);
    }
}
declare module TypeDoc.Factories {
    /**
    * A factory that creates signature reflections.
    */
    class ResolveHandler {
        private dispatcher;
        constructor(dispatcher: Dispatcher);
        public onEnterDeclaration(state: DeclarationState): void;
    }
}
declare module TypeDoc.Factories {
    /**
    * A factory that creates signature reflections.
    */
    class SignatureHandler {
        private dispatcher;
        constructor(dispatcher: Dispatcher);
        private onEnterDeclaration(state);
        private onProcess(state);
        static isMethodOverwrite(state: any): boolean;
    }
}
declare module TypeDoc.Factories {
    class SourceHandler {
        private dispatcher;
        private basePath;
        private fileMappings;
        constructor(dispatcher: Dispatcher);
        public onEnterDocument(state: DocumentState): void;
        public onProcess(state: DeclarationState): void;
        public onEnterResolve(): void;
        public onResolveReflection(reflection: Models.DeclarationReflection): void;
        public onLeaveResolve(): void;
    }
}
declare module TypeDoc.Factories {
    /**
    * A factory that converts all instances of LateResolvingType to their renderable equivalents.
    */
    class TypeHandler {
        private dispatcher;
        constructor(dispatcher: Dispatcher);
        public onResolveReflection(reflection: Models.DeclarationReflection): void;
        private resolveTypes(types);
        private resolveType(type);
    }
}
declare module TypeDoc.Factories {
    /**
    * Base class of all states.
    *
    * States store the current declaration and its matching reflection while
    * being processed by the dispatcher. Factories can alter the state and
    * stop it from being further processed.
    * For each child declaration the dispatcher will create a child {DeclarationState}
    * state. The root state is always an instance of {DocumentState}.
    */
    class BaseState extends Event {
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
        * Create a new BaseState instance.
        */
        constructor(parentState: BaseState, declaration: TypeScript.PullDecl, reflection?: Models.BaseReflection);
        /**
        * Check whether the given flag is set on the declaration of this state.
        *
        * @param flag   The flag that should be looked for.
        */
        public hasFlag(flag: number): boolean;
        /**
        * @param kind  The kind to test for.
        */
        public kindOf(kind: TypeScript.PullElementKind): boolean;
        /**
        * @param kind  An array of kinds to test for.
        */
        public kindOf(kind: TypeScript.PullElementKind[]): boolean;
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
        * The dispatcher that has created this state.
        */
        public dispatcher: Dispatcher;
        /**
        * The TypeScript document all following declarations are derived from.
        */
        public document: TypeScript.Document;
        /**
        * The project the reflections should be stored to.
        */
        public reflection: Models.ProjectReflection;
        /**
        * Create a new DocumentState instance.
        *
        * @param dispatcher  The dispatcher that has created this state.
        * @param document    The TypeScript document that contains the declarations.
        */
        constructor(dispatcher: Dispatcher, document: TypeScript.Document);
    }
}
declare module TypeDoc.Models {
    class Comment {
        public shortText: string;
        public text: string;
        public returns: string;
        public tags: CommentTag[];
        constructor(shortText?: string, text?: string);
        public hasTag(tag: string): boolean;
        public getTag(tagName: string, paramName?: string): CommentTag;
    }
}
declare module TypeDoc.Models {
    class CommentTag {
        public tagName: string;
        public paramName: string;
        public text: string;
        constructor(tagName: string, paramName?: string, text?: string);
    }
}
declare module TypeDoc.Models {
    /**
    * Check whether the given flag is set in the given value.
    *
    * @param value  The value that should be tested.
    * @param flag   The flag that should be looked for.
    */
    function hasFlag(value: number, flag: number): boolean;
    function hasModifier(modifiers: TypeScript.PullElementFlags[], flag: TypeScript.PullElementFlags): boolean;
    function classify(str: string): string;
    /**
    * Return a string representation of the given value based upon the given enumeration.
    *
    * @param value        The value that contains the bit mask that should be explained.
    * @param enumeration  The enumeration the bits in the value correspond to.
    * @param separator    A string used to concat the found flags.
    * @returns            A string representation of the given value.
    */
    function flagsToString(value: number, enumeration: any, separator?: string): string;
    /**
    * Base class for all our reflection classes.
    */
    class BaseReflection {
        /**
        * The reflection this reflection is a child of.
        */
        public parent: BaseReflection;
        /**
        * The children of this reflection.
        */
        public children: DeclarationReflection[];
        public groups: ReflectionGroup[];
        /**
        * The symbol name of this reflection.
        */
        public name: string;
        public comment: Comment;
        public url: string;
        public hasOwnDocument: boolean;
        private alias;
        /**
        * Create a new BaseReflection instance.
        */
        constructor();
        public getFullName(separator?: string): string;
        /**
        * Return a child by its name.
        *
        * @param name  The name of the child to look for.
        * @returns     The found child or NULL.
        */
        public getChildByName(name: string): DeclarationReflection;
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
    interface IHierarchy {
        type: BaseType;
        children?: IHierarchy[];
    }
    interface ISource {
        fileName: string;
        file?: SourceFile;
        line: number;
    }
    class DeclarationReflection extends BaseReflection {
        public definition: string;
        public signatures: DeclarationReflection[];
        public type: BaseType;
        public extendedTypes: BaseType[];
        public extendedBy: BaseType[];
        public kind: TypeScript.PullElementKind;
        public kindString: string;
        public flags: TypeScript.PullElementFlags;
        public sources: ISource[];
        public defaultValue: string;
        public isOptional: boolean;
        public overwrites: BaseType;
        public inheritedFrom: BaseType;
        public flagsArray: any;
        public typeHierarchy: any;
        public cssClasses: any;
        constructor();
        /**
        * @param kind  The kind to test for.
        */
        public kindOf(kind: TypeScript.PullElementKind): boolean;
        /**
        * @param kind  An array of kinds to test for.
        */
        public kindOf(kind: TypeScript.PullElementKind[]): boolean;
        public getTypeHierarchy(): IHierarchy;
        public getCssClasses(): string;
        public getFlagsArray(): any[];
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
    class ProjectReflection extends BaseReflection {
        public reflections: DeclarationReflection[];
        public directory: SourceDirectory;
        public files: SourceFile[];
        /**
        * Return a list of all reflections in this project of a certain kind.
        *
        * @param kind  The desired kind of reflection.
        * @returns     An array containing all reflections with the desired kind.
        */
        public getReflectionsByKind(kind: TypeScript.PullElementKind): DeclarationReflection[];
    }
}
declare module TypeDoc.Models {
    class ReflectionGroup {
        public title: string;
        public kind: TypeScript.PullElementKind;
        public children: DeclarationReflection[];
        public allChildrenHaveOwnDocument: any;
        constructor(title: string, kind: TypeScript.PullElementKind);
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
    class RenderOutput extends Event {
        public target: RenderTarget;
        public filename: string;
        public url: string;
        public model: any;
        public template: (context: any) => string;
        public templateName: string;
        public navigation: NavigationItem;
        public secondary: NavigationItem[];
        public contents: string;
        constructor(target: RenderTarget);
    }
}
declare module TypeDoc.Models {
    class RenderTarget extends Event {
        public project: ProjectReflection;
        public dirname: string;
        public urls: UrlMapping[];
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
declare module TypeDoc.Renderer {
    class BasePlugin {
        public renderer: Renderer;
        constructor(renderer: Renderer);
    }
}
declare module TypeDoc.Renderer {
    class BaseTheme {
        public renderer: Renderer;
        public project: Models.ProjectReflection;
        public basePath: string;
        constructor(renderer: Renderer, project: Models.ProjectReflection, basePath: string);
        public initialize(): void;
        public isOutputDirectory(dirname: string): boolean;
        public getUrls(): Models.UrlMapping[];
        public getNavigation(): Models.NavigationItem;
    }
}
declare module TypeDoc.Renderer {
    interface IHandlebarTemplate {
        (context?: any, options?: any): string;
    }
    class Renderer extends EventDispatcher {
        public application: Application;
        public plugins: BasePlugin[];
        public theme: BaseTheme;
        public ioHost: TypeScript.IIO;
        public dirName: string;
        private templates;
        static PLUGIN_CLASSES: any[];
        constructor(application: Application);
        public setTheme(dirname: string): void;
        public getDefaultTheme(): string;
        public getTemplate(fileName: string): IHandlebarTemplate;
        public render(): void;
        private renderTarget(target);
    }
}
declare module TypeDoc.Renderer {
    class AssetsPlugin extends BasePlugin {
        constructor(renderer: Renderer);
        private onRendererBeginTarget(target);
    }
}
declare module TypeDoc.Renderer {
    class LayoutPlugin extends BasePlugin {
        constructor(renderer: Renderer);
        private onRendererEndOutput(output);
    }
}
declare module TypeDoc.Renderer {
    class NavigationPlugin extends BasePlugin {
        public navigation: Models.NavigationItem;
        public location: string;
        constructor(renderer: Renderer);
        private onRendererBeginTarget(target);
        private onRendererBeginOutput(output);
    }
}
declare module TypeDoc.Renderer {
    class PartialsPlugin extends BasePlugin {
        constructor(renderer: Renderer);
        private onRendererBeginTarget(target);
    }
}
declare module TypeDoc {
    /**
    *
    * @param file
    * @returns {TypeScript.FileInformation}
    */
    function readFile(file: any): string;
}
