export { AbstractComponent } from "./component.js";
export * from "./fs.js";
export { getLoadedPaths, hasBeenLoadedMultipleTimes, TYPEDOC_ROOT } from "./general.js";
export { FancyConsoleLogger } from "./loggers.js";
export {
    ArgumentsReader,
    CommentStyle,
    Option,
    OptionDefaults,
    Options,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
} from "./options/index.js";
export type {
    ArrayDeclarationOption,
    BooleanDeclarationOption,
    DeclarationOption,
    DeclarationOptionBase,
    DeclarationOptionToOptionType,
    FlagsDeclarationOption,
    JsDocCompatibility,
    KeyToDeclaration,
    ManuallyValidatedOption,
    MapDeclarationOption,
    MixedDeclarationOption,
    NumberDeclarationOption,
    ObjectDeclarationOption,
    OptionsReader,
    OutputSpecification,
    ParameterTypeToOptionTypeMap,
    StringDeclarationOption,
    TypeDocOptionMap,
    TypeDocOptions,
    TypeDocOptionValues,
    ValidationOptions,
} from "./options/index.js";
export * from "./paths.js";
export { loadPlugins } from "./plugins.js";
export { getSortFunction } from "./sort.js";
export type { SortStrategy } from "./sort.js";

export * from "./entry-point.js";

export * from "./tsconfig.js";
export * from "./tsutils.js";
