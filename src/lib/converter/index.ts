export type {
    ComponentPath,
    DeclarationReference,
    Meaning,
    MeaningKeyword,
    SymbolReference,
} from "./comments/declarationReference.js";
export type { CommentParserConfig } from "./comments/index.js";
export type { ExternalResolveResult, ExternalSymbolResolver } from "./comments/linkResolver.js";
export { Context } from "./context.js";
export { convertDefaultValue, convertExpression } from "./convert-expression.js";
export { Converter, type ConverterEvents } from "./converter.js";
