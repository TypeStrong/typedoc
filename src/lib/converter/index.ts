export { Context } from "./context";
export { Converter } from "./converter";
export type { CommentParserConfig } from "./comments/index";
export { convertDefaultValue, convertExpression } from "./convert-expression";
export type {
    DeclarationReference,
    SymbolReference,
    ComponentPath,
    Meaning,
    MeaningKeyword,
} from "./comments/declarationReference";
export type {
    ExternalSymbolResolver,
    ExternalResolveResult,
} from "./comments/linkResolver";

import "./plugins/index";
