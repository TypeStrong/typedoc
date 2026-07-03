export { AbstractComponent } from "./component.js";
export * from "./fs.js";
export {
    getLoadedPaths,
    hasBeenLoadedMultipleTimes,
    isDebugging,
    SUPPORTED_TYPESCRIPT_VERSIONS,
    TYPEDOC_ROOT,
    TYPEDOC_VERSION,
    TYPESCRIPT_ROOT,
} from "./general.js";
export { diagnostic, diagnostics, FancyConsoleLogger } from "./loggers.js";

export * from "./paths.js";
export { loadPlugins } from "./plugins.js";
export { getSortFunction } from "./sort.js";
export type { SortStrategy } from "./sort.js";

export * as Configuration from "./options/index.js";
export {
    ArgumentsReader,
    type ArrayDeclarationOption,
    type BooleanDeclarationOption,
    CommentStyle,
    type DeclarationOption,
    type DeclarationOptionBase,
    type DeclarationOptionToOptionType,
    type FlagsDeclarationOption,
    type JsDocCompatibility,
    type KeyToDeclaration,
    type ManuallyValidatedOption,
    type MapDeclarationOption,
    type MixedDeclarationOption,
    type NumberDeclarationOption,
    type ObjectDeclarationOption,
    Option,
    OptionDefaults,
    Options,
    type OptionsReader,
    type OutputSpecification,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    type StringDeclarationOption,
    TSConfigReader,
    type TypeDocOptionMap,
    type TypeDocOptions,
    type TypeDocOptionValues,
    TypeDocReader,
    type ValidationOptions,
} from "./options/index.ts";

export { addTypeDocOptions } from "./options/sources/typedoc.ts";

export * from "./compress.js";
export * from "./entry-point.js";
export * from "./options/index.js";
export * from "./reflections.js";
export * from "./sort.js";

export * from "./declaration-maps.js";
export * from "./highlighter.js";
export * from "./html.js";
export * from "./tsconfig.js";
export * from "./tsutils.js";
export * from "./ValidatingFileRegistry.js";
