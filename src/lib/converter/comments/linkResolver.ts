import * as ts from "typescript";
import {
    Comment,
    CommentDisplayPart,
    DeclarationReflection,
    InlineTagDisplayPart,
    Reflection,
} from "../../models";
import type { Logger, ValidationOptions } from "../../utils";
import {
    DeclarationReference,
    parseDeclarationReference,
} from "./declarationReference";
import { resolveDeclarationReference } from "./declarationReferenceResolver";

const urlPrefix = /^(http|ftp)s?:\/\//;
const brackets = /\[\[(?!include:)([^\]]+)\]\]/g;

export type ExternalResolveResult = { target: string; caption?: string };
export type ExternalSymbolResolver = (
    ref: DeclarationReference,
    part?: CommentDisplayPart,
    refl?: Reflection
) => ExternalResolveResult | string | undefined;

export function resolveLinks(
    comment: Comment,
    reflection: Reflection,
    validation: ValidationOptions,
    logger: Logger,
    externalResolver: ExternalSymbolResolver
) {
    let warned = false;
    const warn = () => {
        if (!warned) {
            warned = true;
            logger.warn(
                `${reflection.getFriendlyFullName()}: Comment [[target]] style links are deprecated and will be removed in 0.24`
            );
        }
    };

    comment.summary = resolvePartLinks(
        reflection,
        comment.summary,
        warn,
        validation,
        logger,
        externalResolver
    );
    for (const tag of comment.blockTags) {
        tag.content = resolvePartLinks(
            reflection,
            tag.content,
            warn,
            validation,
            logger,
            externalResolver
        );
    }

    if (reflection instanceof DeclarationReflection && reflection.readme) {
        reflection.readme = resolvePartLinks(
            reflection,
            reflection.readme,
            warn,
            validation,
            logger,
            externalResolver
        );
    }
}

export function resolvePartLinks(
    reflection: Reflection,
    parts: readonly CommentDisplayPart[],
    warn: () => void,
    validation: ValidationOptions,
    logger: Logger,
    externalResolver: ExternalSymbolResolver
): CommentDisplayPart[] {
    return parts.flatMap((part) =>
        processPart(
            reflection,
            part,
            warn,
            validation,
            logger,
            externalResolver
        )
    );
}

function processPart(
    reflection: Reflection,
    part: CommentDisplayPart,
    warn: () => void,
    validation: ValidationOptions,
    logger: Logger,
    externalResolver: ExternalSymbolResolver
): CommentDisplayPart | CommentDisplayPart[] {
    if (part.kind === "text" && brackets.test(part.text)) {
        warn();
        return replaceBrackets(reflection, part.text, validation, logger);
    }

    if (part.kind === "inline-tag") {
        if (
            part.tag === "@link" ||
            part.tag === "@linkcode" ||
            part.tag === "@linkplain"
        ) {
            return resolveLinkTag(
                reflection,
                part,
                externalResolver,
                (msg: string) => {
                    if (validation.invalidLink) {
                        logger.warn(msg);
                    }
                }
            );
        }
    }

    return part;
}

function resolveLinkTag(
    reflection: Reflection,
    part: InlineTagDisplayPart,
    externalResolver: ExternalSymbolResolver,
    warn: (message: string) => void
) {
    let pos = 0;
    const end = part.text.length;
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }
    const origText = part.text;

    // Try to parse one
    const declRef = parseDeclarationReference(part.text, pos, end);

    let target: Reflection | string | undefined;
    let defaultDisplayText: string;
    if (declRef) {
        // Got one, great! Try to resolve the link
        target = resolveDeclarationReference(reflection, declRef[0]);
        pos = declRef[1];

        if (target) {
            defaultDisplayText = target.name;
        } else {
            // If we didn't find a link, it might be a @link tag to an external symbol, check that next.
            let externalResolveResult = externalResolver(
                declRef[0],
                part,
                reflection
            );

            defaultDisplayText = part.text.substring(0, pos);

            switch (typeof externalResolveResult) {
                case "string":
                    target = externalResolveResult as string;
                    break;
                case "object":
                    externalResolveResult =
                        externalResolveResult as ExternalResolveResult;
                    part.target = externalResolveResult.target;
                    part.text =
                        externalResolveResult.caption || defaultDisplayText;
                    return part;
            }
        }
    }

    if (!target) {
        if (urlPrefix.test(part.text)) {
            const wsIndex = part.text.search(/\s/);
            target =
                wsIndex === -1 ? part.text : part.text.substring(0, wsIndex);
            pos = target.length;
            defaultDisplayText = target;
        }
    }

    // If resolution via a declaration reference failed, revert to the legacy "split and check"
    // method... this should go away in 0.24, once people have had a chance to migrate any failing links.
    if (!target) {
        const resolved = legacyResolveLinkTag(reflection, part);
        if (resolved.target) {
            warn(
                `Failed to resolve {@link ${origText}} in ${reflection.getFriendlyFullName()} with declaration references. This link will break in v0.24.`
            );
        }
        return resolved;
    }

    // Remaining text after an optional pipe is the link text, so advance
    // until that's consumed.
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }
    if (pos < end && part.text[pos] === "|") {
        pos++;
    }

    part.target = target;
    part.text = part.text.substring(pos).trim() || defaultDisplayText!;

    return part;
}

function legacyResolveLinkTag(
    reflection: Reflection,
    part: InlineTagDisplayPart
) {
    const { caption, target } = splitLinkText(part.text);

    if (urlPrefix.test(target)) {
        part.text = caption;
        part.target = target;
    } else {
        const targetRefl = reflection.findReflectionByName(target);
        if (targetRefl) {
            part.text = caption;
            part.target = targetRefl;
        }
    }

    return part;
}

function replaceBrackets(
    reflection: Reflection,
    text: string,
    validation: ValidationOptions,
    logger: Logger
): CommentDisplayPart[] {
    const parts: CommentDisplayPart[] = [];

    let begin = 0;
    brackets.lastIndex = 0;
    for (const match of text.matchAll(brackets)) {
        if (begin != match.index) {
            parts.push({
                kind: "text",
                text: text.substring(begin, match.index),
            });
        }
        begin = match.index! + match[0].length;
        const content = match[1];

        const { target, caption } = splitLinkText(content);

        if (urlPrefix.test(target)) {
            parts.push({
                kind: "inline-tag",
                tag: "@link",
                text: caption,
                target,
            });
        } else {
            const targetRefl = reflection.findReflectionByName(target);
            if (targetRefl) {
                parts.push({
                    kind: "inline-tag",
                    tag: "@link",
                    text: caption,
                    target: targetRefl,
                });
            } else {
                if (validation.invalidLink) {
                    logger.warn("Failed to find target: " + content);
                }
                parts.push({
                    kind: "inline-tag",
                    tag: "@link",
                    text: content,
                });
            }
        }
    }
    parts.push({
        kind: "text",
        text: text.substring(begin),
    });

    return parts;
}

/**
 * Split the given link into text and target at first pipe or space.
 *
 * @param text  The source string that should be checked for a split character.
 * @returns An object containing the link text and target.
 */
function splitLinkText(text: string): { caption: string; target: string } {
    let splitIndex = text.indexOf("|");
    if (splitIndex === -1) {
        splitIndex = text.search(/\s/);
    }

    if (splitIndex !== -1) {
        return {
            caption: text
                .substring(splitIndex + 1)
                .replace(/\n+/, " ")
                .trim(),
            target: text.substring(0, splitIndex).trim(),
        };
    } else {
        return {
            caption: text,
            target: text,
        };
    }
}
