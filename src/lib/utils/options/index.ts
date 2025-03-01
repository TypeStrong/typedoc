export { CommentStyle, EmitStrategy, ParameterHint, ParameterType } from "./declaration.js";
export { Option, Options } from "./options.js";
export type { OptionsReader } from "./options.js";
export { ArgumentsReader, PackageJsonReader, TSConfigReader, TypeDocReader } from "./readers/index.js";

export type {
    ArrayDeclarationOption,
    BooleanDeclarationOption,
    DeclarationOption,
    DeclarationOptionBase,
    DeclarationOptionToOptionType,
    FlagsDeclarationOption,
    GlobArrayDeclarationOption,
    JsDocCompatibility,
    KeyToDeclaration,
    ManuallyValidatedOption,
    MapDeclarationOption,
    MixedDeclarationOption,
    NumberDeclarationOption,
    ObjectDeclarationOption,
    OutputSpecification,
    ParameterTypeToOptionTypeMap,
    StringDeclarationOption,
    TypeDocOptionMap,
    TypeDocOptions,
    TypeDocOptionValues,
    TypeDocPackageOptions,
    ValidationOptions,
} from "./declaration.js";

export * as OptionDefaults from "./defaults.js";
