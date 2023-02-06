import * as ts from "typescript";
import { Comment, ReflectionKind } from "../../models";
import { assertNever, Logger } from "../../utils";
import type { CommentStyle } from "../../utils/options/declaration";
import { lexBlockComment } from "./blockLexer";
import { discoverComment, discoverSignatureComment } from "./discovery";
import { lexLineComments } from "./lineLexer";
import { parseComment } from "./parser";

export interface CommentParserConfig {
    blockTags: Set<string>;
    inlineTags: Set<string>;
    modifierTags: Set<string>;
}

const jsDocCommentKinds = [
    ts.SyntaxKind.JSDocPropertyTag,
    ts.SyntaxKind.JSDocCallbackTag,
    ts.SyntaxKind.JSDocTypedefTag,
    ts.SyntaxKind.JSDocTemplateTag,
    ts.SyntaxKind.JSDocEnumTag,
];

const commentCache = new WeakMap<ts.SourceFile, Map<number, Comment>>();

function getCommentWithCache(
    discovered: [ts.SourceFile, ts.CommentRange[]] | undefined,
    config: CommentParserConfig,
    logger: Logger
) {
    if (!discovered) return;

    const [file, ranges] = discovered;
    const cache = commentCache.get(file) || new Map<number, Comment>();
    if (cache?.has(ranges[0].pos)) {
        return cache.get(ranges[0].pos)!.clone();
    }

    let comment: Comment;
    switch (ranges[0].kind) {
        case ts.SyntaxKind.MultiLineCommentTrivia:
            comment = parseComment(
                lexBlockComment(file.text, ranges[0].pos, ranges[0].end),
                config,
                file,
                logger
            );
            break;
        case ts.SyntaxKind.SingleLineCommentTrivia:
            comment = parseComment(
                lexLineComments(file.text, ranges),
                config,
                file,
                logger
            );
            break;
        default:
            assertNever(ranges[0].kind);
    }

    cache.set(ranges[0].pos, comment);
    commentCache.set(file, cache);

    return comment.clone();
}

function getCommentImpl(
    commentSource: [ts.SourceFile, ts.CommentRange[]] | undefined,
    config: CommentParserConfig,
    logger: Logger,
    moduleComment: boolean
) {
    const comment = getCommentWithCache(commentSource, config, logger);

    if (moduleComment && comment) {
        // Module comment, make sure it is tagged with @packageDocumentation or @module.
        // If it isn't then the comment applies to the first statement in the file, so throw it away.
        if (
            !comment.hasModifier("@packageDocumentation") &&
            !comment.getTag("@module")
        ) {
            return;
        }
    }

    if (!moduleComment && comment) {
        // Ensure module comments are not attached to non-module reflections.
        if (
            comment.hasModifier("@packageDocumentation") ||
            comment.getTag("@module")
        ) {
            return;
        }
    }

    return comment;
}

export function getComment(
    symbol: ts.Symbol,
    kind: ReflectionKind,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle
): Comment | undefined {
    if (
        symbol
            .getDeclarations()
            ?.every((d) => jsDocCommentKinds.includes(d.kind))
    ) {
        return getJsDocComment(
            symbol.declarations![0] as ts.JSDocPropertyLikeTag,
            config,
            logger
        );
    }

    const comment = getCommentImpl(
        discoverComment(symbol, kind, logger, commentStyle),
        config,
        logger,
        symbol.declarations?.some(ts.isSourceFile) || false
    );

    if (!comment && kind === ReflectionKind.Property) {
        return getConstructorParamPropertyComment(
            symbol,
            config,
            logger,
            commentStyle
        );
    }

    return comment;
}

function getConstructorParamPropertyComment(
    symbol: ts.Symbol,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle
): Comment | undefined {
    const decl = symbol.declarations?.find(ts.isParameter);
    if (!decl) return;

    const ctor = decl.parent;
    const comment = getSignatureComment(ctor, config, logger, commentStyle);

    const paramTag = comment?.getIdentifiedTag(symbol.name, "@param");
    if (paramTag) {
        return new Comment(paramTag.content);
    }
}

export function getSignatureComment(
    declaration: ts.SignatureDeclaration | ts.JSDocSignature,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle
): Comment | undefined {
    return getCommentImpl(
        discoverSignatureComment(declaration, commentStyle),
        config,
        logger,
        false
    );
}

export function getJsDocComment(
    declaration:
        | ts.JSDocPropertyLikeTag
        | ts.JSDocCallbackTag
        | ts.JSDocTypedefTag
        | ts.JSDocTemplateTag
        | ts.JSDocEnumTag,
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
            [
                {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: parent.pos,
                    end: parent.end,
                },
            ],
        ],
        config,
        logger
    )!;

    // And pull out the tag we actually care about.
    if (ts.isJSDocEnumTag(declaration)) {
        return new Comment(comment.getTag("@enum")?.content);
    }

    if (
        ts.isJSDocTemplateTag(declaration) &&
        declaration.comment &&
        declaration.typeParameters.length > 1
    ) {
        // We could just put the same comment on everything, but due to how comment parsing works,
        // we'd have to search for any @template with a name starting with the first type parameter's name
        // which feels horribly hacky.
        logger.warn(
            `TypeDoc does not support multiple type parameters defined in a single @template tag with a comment.`,
            declaration
        );
        return;
    }

    let name: string | undefined;
    if (ts.isJSDocTemplateTag(declaration)) {
        // This isn't really ideal.
        name = declaration.typeParameters[0].name.text;
    } else {
        name = declaration.name?.getText();
    }

    if (!name) {
        return;
    }

    const tag = comment.getIdentifiedTag(name, `@${declaration.tagName.text}`);

    if (!tag) {
        logger.error(
            `Failed to find JSDoc tag for ${name} after parsing comment, please file a bug report.`,
            declaration
        );
    } else {
        return new Comment(Comment.cloneDisplayParts(tag.content));
    }
}
