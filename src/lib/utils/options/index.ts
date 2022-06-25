export { Options, BindOption } from "./options";
export type { OptionsReader } from "./options";
export { ArgumentsReader, TypeDocReader, TSConfigReader } from "./readers";
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
    MapDeclarationOption,
    FlagsDeclarationOption,
    DeclarationOptionToOptionType,
    TypeDocOptionValues,
    ParameterTypeToOptionTypeMap,
    ManuallyValidatedOption,
} from "./declaration";
