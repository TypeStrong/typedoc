export { Context } from "./context.js";
export { Converter } from "./converter.js";
export type { CommentParserConfig } from "./comments/index.js";
export {
    convertDefaultValue,
    convertExpression,
} from "./convert-expression.js";
export type {
    DeclarationReference,
    SymbolReference,
    ComponentPath,
    Meaning,
    MeaningKeyword,
} from "./comments/declarationReference.js";
export type {
    ExternalSymbolResolver,
    ExternalResolveResult,
} from "./comments/linkResolver.js";

import "./plugins/index.js";
