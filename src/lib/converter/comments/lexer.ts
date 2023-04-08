import type { ReflectionSymbolId } from "../../models";

export enum TokenSyntaxKind {
    Text = "text",
    NewLine = "new_line",
    OpenBrace = "open_brace",
    CloseBrace = "close_brace",
    Tag = "tag",
    Code = "code",
    TypeAnnotation = "type",
}

export interface Token {
    kind: TokenSyntaxKind;
    text: string;

    pos: number;

    // These come from the compiler for use if useTsLinkResolution is on
    tsLinkTarget?: ReflectionSymbolId;
    tsLinkText?: string;
}
