import * as ts from "typescript";
import type { Comment, ReflectionKind } from "../../models";
import { assertNever, Logger } from "../../utils";
import { lexBlockComment } from "./blockLexer";
import { discoverComment, discoverSignatureComment } from "./discovery";
import { parseComment } from "./parser";

export interface CommentParserConfig {
    blockTags: Set<string>;
    inlineTags: Set<string>;
    modifierTags: Set<string>;
}

export function getComment(
    symbol: ts.Symbol,
    kind: ReflectionKind,
    config: CommentParserConfig,
    logger: Logger
): Comment | undefined {
    const comment = discoverComment(symbol, kind);
    let resultingComment: Comment | undefined;

    if (comment) {
        const [file, range] = comment;
        const { line } = ts.getLineAndCharacterOfPosition(file, range.pos);
        logger.verbose(`Parsing comment at ${file.fileName}:${line}`);
        const warning = (warning: string) =>
            logger.warn(`${warning} in comment at ${file.fileName}:${line}.`);

        switch (range.kind) {
            case ts.SyntaxKind.MultiLineCommentTrivia:
                resultingComment = parseComment(
                    lexBlockComment(file.text, range.pos, range.end),
                    config,
                    warning
                );
                break;
            case ts.SyntaxKind.SingleLineCommentTrivia:
                throw "GERRIT FIX ME";
            default:
                assertNever(range.kind);
        }
    }

    if (symbol.declarations?.some(ts.isSourceFile) && resultingComment) {
        // Module comment, make sure it is tagged with @packageDocumentation or @module.
        // If it isn't then the comment applies to the first statement in the file, so throw it away.
        if (
            !resultingComment.hasModifier("@packageDocumentation") &&
            !resultingComment.getTag("@module")
        ) {
            return;
        }
    }

    return resultingComment;
}

export function getSignatureComment(
    declaration: ts.SignatureDeclaration | ts.JSDocSignature,
    config: CommentParserConfig,
    logger: Logger
): Comment | undefined {
    const comment = discoverSignatureComment(declaration);

    if (comment) {
        const [file, range] = comment;
        const { line } = ts.getLineAndCharacterOfPosition(file, range.pos);
        logger.verbose(`Parsing signature comment at ${file.fileName}:${line}`);
        const warning = (warning: string) =>
            logger.warn(`${warning} in comment at ${file.fileName}:${line}.`);

        switch (range.kind) {
            case ts.SyntaxKind.MultiLineCommentTrivia:
                return parseComment(
                    lexBlockComment(file.text, range.pos, range.end),
                    config,
                    warning
                );
            case ts.SyntaxKind.SingleLineCommentTrivia:
                throw "GERRIT FIX ME";
            default:
                assertNever(range.kind);
        }
    }
}
