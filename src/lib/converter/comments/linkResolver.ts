import * as ts from "typescript";
import {
    Comment,
    CommentDisplayPart,
    DeclarationReflection,
    InlineTagDisplayPart,
    Reflection,
} from "../../models";
import { parseDeclarationReference } from "./declarationReference";
import { resolveDeclarationReference } from "./declarationReferenceResolver";

const urlPrefix = /^(http|ftp)s?:\/\//;

export function resolveLinks(comment: Comment, reflection: Reflection) {
    comment.summary = resolvePartLinks(reflection, comment.summary);
    for (const tag of comment.blockTags) {
        tag.content = resolvePartLinks(reflection, tag.content);
    }

    if (reflection instanceof DeclarationReflection && reflection.readme) {
        reflection.readme = resolvePartLinks(reflection, reflection.readme);
    }
}

export function resolvePartLinks(
    reflection: Reflection,
    parts: readonly CommentDisplayPart[]
): CommentDisplayPart[] {
    return parts.flatMap((part) => processPart(reflection, part));
}

function processPart(
    reflection: Reflection,
    part: CommentDisplayPart
): CommentDisplayPart | CommentDisplayPart[] {
    if (part.kind === "inline-tag") {
        if (
            part.tag === "@link" ||
            part.tag === "@linkcode" ||
            part.tag === "@linkplain"
        ) {
            return resolveLinkTag(reflection, part);
        }
    }

    return part;
}

function resolveLinkTag(reflection: Reflection, part: InlineTagDisplayPart) {
    let pos = 0;
    const end = part.text.length;
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }

    // Try to parse one
    const declRef = parseDeclarationReference(part.text, pos, end);

    let target: Reflection | string | undefined;
    if (declRef) {
        // Got one, great! Try to resolve the link
        target = resolveDeclarationReference(reflection, declRef[0]);
        pos = declRef[1];
    }

    if (!target) {
        if (urlPrefix.test(part.text)) {
            const wsIndex = part.text.search(/\s/);
            target =
                wsIndex === -1 ? part.text : part.text.substring(0, wsIndex);
            pos = target.length;
        }
    }

    // Remaining text after an optional pipe is the link text, so advance
    // until that's consumed.
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }
    if (pos < end && part.text[pos] === "|") {
        pos++;
    }

    if (!target) {
        return part;
    }

    part.target = target;
    part.text =
        part.text.substring(pos).trim() ||
        (typeof target === "string" ? target : target.name);

    return part;
}
