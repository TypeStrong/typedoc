import * as ts from "typescript";
import { Comment, ReflectionKind } from "../../models";
import { assertNever, Logger } from "../../utils";
import { lexBlockComment } from "./blockLexer";
import { discoverComment, discoverSignatureComment } from "./discovery";
import { parseComment } from "./parser";

export interface CommentParserConfig {
    blockTags: Set<string>;
    inlineTags: Set<string>;
    modifierTags: Set<string>;
}

const commentCache = new WeakMap<ts.SourceFile, Map<number, Comment>>();

function getCommentWithCache(
    discovered: [ts.SourceFile, ts.CommentRange] | undefined,
    config: CommentParserConfig,
    logger: Logger
) {
    if (!discovered) return;

    const [file, range] = discovered;
    const cache = commentCache.get(file) || new Map<number, Comment>();
    if (cache?.has(range.pos)) {
        return cache.get(range.pos)!.clone();
    }

    const line = ts.getLineAndCharacterOfPosition(file, range.pos).line + 1;
    logger.verbose(`Parsing comment at ${file.fileName}:${line}`);
    const warning = (warning: string) =>
        logger.warn(`${warning} in comment at ${file.fileName}:${line}.`);

    let comment: Comment;
    switch (range.kind) {
        case ts.SyntaxKind.MultiLineCommentTrivia:
            comment = parseComment(
                lexBlockComment(file.text, range.pos, range.end),
                config,
                warning
            );
            break;
        case ts.SyntaxKind.SingleLineCommentTrivia:
            throw "GERRIT FIX ME"; // GERRIT
        default:
            assertNever(range.kind);
    }

    cache.set(range.pos, comment);
    commentCache.set(file, cache);

    return comment.clone();
}

export function getComment(
    symbol: ts.Symbol,
    kind: ReflectionKind,
    config: CommentParserConfig,
    logger: Logger
): Comment | undefined {
    const comment = getCommentWithCache(
        discoverComment(symbol, kind),
        config,
        logger
    );

    if (symbol.declarations?.some(ts.isSourceFile) && comment) {
        // Module comment, make sure it is tagged with @packageDocumentation or @module.
        // If it isn't then the comment applies to the first statement in the file, so throw it away.
        if (
            !comment.hasModifier("@packageDocumentation") &&
            !comment.getTag("@module")
        ) {
            return;
        }
    }

    return comment;
}

export function getSignatureComment(
    declaration: ts.SignatureDeclaration | ts.JSDocSignature,
    config: CommentParserConfig,
    logger: Logger
): Comment | undefined {
    return getCommentWithCache(
        discoverSignatureComment(declaration),
        config,
        logger
    );
}

export function getJsDocTagComment(
    declaration: ts.JSDocPropertyLikeTag,
    config: CommentParserConfig,
    logger: Logger
): Comment | undefined {
    const file = declaration.getSourceFile();

    // First, get the whole comment. We know we'll need all of it.
    let parent: ts.Node = declaration.parent;
    while (!ts.isJSDoc(parent)) {
        parent = parent.parent;
    }

    // Then parse it.
    const comment = getCommentWithCache(
        [
            file,
            {
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                pos: parent.pos,
                end: parent.end,
            },
        ],
        config,
        logger
    )!;

    // And pull out the tag we actually care about.
    const tag = comment.getIdentifiedTag(
        declaration.name.getText(),
        `@${declaration.tagName.text}`
    );

    if (!tag) {
        logger.error(
            `Failed to find JSDoc tag for ${declaration.name.getText()} after parsing comment, please file a bug report with the comment at ${
                file.fileName
            }:${ts.getLineAndCharacterOfPosition(file, parent.pos).line + 1}`
        );
    } else {
        return new Comment(Comment.cloneDisplayParts(tag.content));
    }
}
