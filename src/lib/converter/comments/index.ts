import ts from "typescript";
import { Comment, ReflectionKind } from "../../models";
import { assertNever, Logger } from "../../utils";
import type {
    CommentStyle,
    JsDocCompatibility,
} from "../../utils/options/declaration";
import { lexBlockComment } from "./blockLexer";
import {
    DiscoveredComment,
    discoverComment,
    discoverFileComment,
    discoverNodeComment,
    discoverSignatureComment,
} from "./discovery";
import { lexLineComments } from "./lineLexer";
import { parseComment } from "./parser";

export interface CommentParserConfig {
    blockTags: Set<string>;
    inlineTags: Set<string>;
    modifierTags: Set<string>;
    jsDocCompatibility: JsDocCompatibility;
}

const jsDocCommentKinds = [
    ts.SyntaxKind.JSDocPropertyTag,
    ts.SyntaxKind.JSDocCallbackTag,
    ts.SyntaxKind.JSDocTypedefTag,
    ts.SyntaxKind.JSDocTemplateTag,
    ts.SyntaxKind.JSDocEnumTag,
];

let commentCache = new WeakMap<ts.SourceFile, Map<number, Comment>>();

// We need to do this for tests so that changing the tsLinkResolution option
// actually works. Without it, we'd get the old parsed comment which doesn't
// have the TS symbols attached.
export function clearCommentCache() {
    commentCache = new WeakMap();
}

function getCommentWithCache(
    discovered: DiscoveredComment | undefined,
    config: CommentParserConfig,
    logger: Logger,
    checker: ts.TypeChecker | undefined,
) {
    if (!discovered) return;

    const { file, ranges, jsDoc } = discovered;
    const cache = commentCache.get(file) || new Map<number, Comment>();
    if (cache?.has(ranges[0].pos)) {
        return cache.get(ranges[0].pos)!.clone();
    }

    let comment: Comment;
    switch (ranges[0].kind) {
        case ts.SyntaxKind.MultiLineCommentTrivia:
            comment = parseComment(
                lexBlockComment(
                    file.text,
                    ranges[0].pos,
                    ranges[0].end,
                    jsDoc,
                    checker,
                ),
                config,
                file,
                logger,
            );
            break;
        case ts.SyntaxKind.SingleLineCommentTrivia:
            comment = parseComment(
                lexLineComments(file.text, ranges),
                config,
                file,
                logger,
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
    commentSource: DiscoveredComment | undefined,
    config: CommentParserConfig,
    logger: Logger,
    moduleComment: boolean,
    checker: ts.TypeChecker | undefined,
) {
    const comment = getCommentWithCache(commentSource, config, logger, checker);

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
    commentStyle: CommentStyle,
    checker: ts.TypeChecker | undefined,
): Comment | undefined {
    const declarations = symbol.declarations || [];

    if (
        declarations.length &&
        declarations.every((d) => jsDocCommentKinds.includes(d.kind))
    ) {
        return getJsDocComment(
            declarations[0] as ts.JSDocPropertyLikeTag,
            config,
            logger,
            checker,
        );
    }

    const isModule = declarations.some((decl) => {
        if (ts.isSourceFile(decl)) return true;
        if (ts.isModuleDeclaration(decl) && ts.isStringLiteral(decl.name)) {
            return true;
        }
        return false;
    });

    const comment = getCommentImpl(
        discoverComment(symbol, kind, logger, commentStyle),
        config,
        logger,
        isModule,
        checker,
    );

    if (!comment && kind === ReflectionKind.Property) {
        return getConstructorParamPropertyComment(
            symbol,
            config,
            logger,
            commentStyle,
            checker,
        );
    }

    return comment;
}

export function getNodeComment(
    node: ts.Node,
    kind: ReflectionKind,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle,
    checker: ts.TypeChecker | undefined,
) {
    return getCommentImpl(
        discoverNodeComment(node, commentStyle),
        config,
        logger,
        kind === ReflectionKind.Module,
        checker,
    );
}

export function getFileComment(
    file: ts.SourceFile,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle,
    checker: ts.TypeChecker | undefined,
): Comment | undefined {
    return getCommentImpl(
        discoverFileComment(file, commentStyle),
        config,
        logger,
        /* moduleComment */ true,
        checker,
    );
}

function getConstructorParamPropertyComment(
    symbol: ts.Symbol,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle,
    checker: ts.TypeChecker | undefined,
): Comment | undefined {
    const decl = symbol.declarations?.find(ts.isParameter);
    if (!decl) return;

    const ctor = decl.parent;
    const comment = getSignatureComment(
        ctor,
        config,
        logger,
        commentStyle,
        checker,
    );

    const paramTag = comment?.getIdentifiedTag(symbol.name, "@param");
    if (paramTag) {
        return new Comment(paramTag.content);
    }
}

export function getSignatureComment(
    declaration: ts.SignatureDeclaration | ts.JSDocSignature,
    config: CommentParserConfig,
    logger: Logger,
    commentStyle: CommentStyle,
    checker: ts.TypeChecker | undefined,
): Comment | undefined {
    return getCommentImpl(
        discoverSignatureComment(declaration, commentStyle),
        config,
        logger,
        false,
        checker,
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
    logger: Logger,
    checker: ts.TypeChecker | undefined,
): Comment | undefined {
    const file = declaration.getSourceFile();

    // First, get the whole comment. We know we'll need all of it.
    let parent: ts.Node = declaration.parent;
    while (!ts.isJSDoc(parent)) {
        parent = parent.parent;
    }

    // Then parse it.
    const comment = getCommentWithCache(
        {
            file,
            ranges: [
                {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: parent.pos,
                    end: parent.end,
                },
            ],
            jsDoc: parent,
        },
        config,
        logger,
        checker,
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
            logger.i18n.multiple_type_parameters_on_template_tag_unsupported(),
            declaration,
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
            logger.i18n.failed_to_find_jsdoc_tag_for_name_0(name),
            declaration,
        );
    } else {
        return new Comment(Comment.cloneDisplayParts(tag.content));
    }
}
