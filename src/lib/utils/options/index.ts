export { Options, Option } from "./options";
export type { OptionsReader } from "./options";
export {
    ArgumentsReader,
    PackageJsonReader,
    TypeDocReader,
    TSConfigReader,
} from "./readers";
export {
    CommentStyle,
    EmitStrategy,
    ParameterType,
    ParameterHint,
} from "./declaration";

export type {
    TypeDocOptions,
    TypeDocOptionMap,
    ValidationOptions,
    KeyToDeclaration,
    DeclarationOption,
    DeclarationOptionBase,
    StringDeclarationOption,
    NumberDeclarationOption,
    BooleanDeclarationOption,
    ArrayDeclarationOption,
    MixedDeclarationOption,
    ObjectDeclarationOption,
    MapDeclarationOption,
    FlagsDeclarationOption,
    DeclarationOptionToOptionType,
    TypeDocOptionValues,
    ParameterTypeToOptionTypeMap,
    ManuallyValidatedOption,
    JsDocCompatibility,
} from "./declaration";
