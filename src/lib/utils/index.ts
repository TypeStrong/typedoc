export { AbstractComponent } from "./component.js";
export {
    isFile,
    copy,
    copySync,
    getCommonDirectory,
    readFile,
    writeFile,
    writeFileSync,
    discoverInParentDir,
    discoverPackageJson,
} from "./fs.js";
export { normalizePath } from "./paths.js";
export {
    TYPEDOC_ROOT,
    getLoadedPaths,
    hasBeenLoadedMultipleTimes,
} from "./general.js";
export { ConsoleLogger, Logger, LogLevel } from "./loggers.js";
export {
    ArgumentsReader,
    Option,
    CommentStyle,
    Options,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
    OptionDefaults,
} from "./options/index.js";
export type {
    ArrayDeclarationOption,
    BooleanDeclarationOption,
    DeclarationOption,
    DeclarationOptionBase,
    DeclarationOptionToOptionType,
    KeyToDeclaration,
    MapDeclarationOption,
    MixedDeclarationOption,
    NumberDeclarationOption,
    FlagsDeclarationOption,
    ObjectDeclarationOption,
    OptionsReader,
    StringDeclarationOption,
    TypeDocOptionMap,
    TypeDocOptions,
    ValidationOptions,
    TypeDocOptionValues,
    ParameterTypeToOptionTypeMap,
    ManuallyValidatedOption,
    JsDocCompatibility,
    OutputSpecification,
} from "./options/index.js";
export { loadPlugins } from "./plugins.js";
export { getSortFunction } from "./sort.js";
export type { SortStrategy } from "./sort.js";

export * from "./entry-point.js";

export * from "./tsutils.js";

export { MinimalSourceFile } from "./minimalSourceFile.js";
