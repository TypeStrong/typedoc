import ts from "typescript";
import {
    Comment,
    CommentDisplayPart,
    DeclarationReflection,
    InlineTagDisplayPart,
    Reflection,
    ReflectionSymbolId,
} from "../../models";
import {
    DeclarationReference,
    parseDeclarationReference,
} from "./declarationReference";
import { resolveDeclarationReference } from "./declarationReferenceResolver";

const urlPrefix = /^(http|ftp)s?:\/\//;

export type ExternalResolveResult = { target: string; caption?: string };
export type ExternalSymbolResolver = (
    ref: DeclarationReference,
    refl: Reflection,
    part: Readonly<CommentDisplayPart> | undefined
) => ExternalResolveResult | string | undefined;

export function resolveLinks(
    comment: Comment,
    reflection: Reflection,
    externalResolver: ExternalSymbolResolver,
    useTsResolution: boolean
) {
    comment.summary = resolvePartLinks(
        reflection,
        comment.summary,
        externalResolver,
        useTsResolution
    );
    for (const tag of comment.blockTags) {
        tag.content = resolvePartLinks(
            reflection,
            tag.content,
            externalResolver,
            useTsResolution
        );
    }

    if (reflection instanceof DeclarationReflection && reflection.readme) {
        reflection.readme = resolvePartLinks(
            reflection,
            reflection.readme,
            externalResolver,
            useTsResolution
        );
    }
}

export function resolvePartLinks(
    reflection: Reflection,
    parts: readonly CommentDisplayPart[],
    externalResolver: ExternalSymbolResolver,
    useTsResolution: boolean
): CommentDisplayPart[] {
    return parts.flatMap((part) =>
        processPart(reflection, part, externalResolver, useTsResolution)
    );
}

function processPart(
    reflection: Reflection,
    part: CommentDisplayPart,
    externalResolver: ExternalSymbolResolver,
    useTsResolution: boolean
): CommentDisplayPart | CommentDisplayPart[] {
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
                useTsResolution
            );
        }
    }

    return part;
}

function resolveLinkTag(
    reflection: Reflection,
    part: InlineTagDisplayPart,
    externalResolver: ExternalSymbolResolver,
    useTsResolution: boolean
) {
    let defaultDisplayText = "";
    let pos = 0;
    const end = part.text.length;
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }

    let target: Reflection | string | undefined;
    if (useTsResolution && part.target instanceof ReflectionSymbolId) {
        target = reflection.project.getReflectionFromSymbolId(part.target);
        if (target) {
            pos = end;
            defaultDisplayText =
                part.text.replace(/^\s*[A-Z_$][\w$]*[ |]*/i, "") || target.name;
        }
    }

    // Try to parse a declaration reference if we didn't use the TS symbol for resolution
    const declRef = !target && parseDeclarationReference(part.text, pos, end);

    if (declRef) {
        // Got one, great! Try to resolve the link
        target = resolveDeclarationReference(reflection, declRef[0]);
        pos = declRef[1];

        if (target) {
            defaultDisplayText = target.name;
        } else {
            // If we didn't find a link, it might be a @link tag to an external symbol, check that next.
            const externalResolveResult = externalResolver(
                declRef[0],
                reflection,
                part
            );

            defaultDisplayText = part.text.substring(0, pos);

            switch (typeof externalResolveResult) {
                case "string":
                    target = externalResolveResult;
                    break;
                case "object":
                    target = externalResolveResult.target;
                    defaultDisplayText =
                        externalResolveResult.caption || defaultDisplayText;
            }
        }
    }

    if (!target && urlPrefix.test(part.text)) {
        const wsIndex = part.text.search(/\s/);
        target = wsIndex === -1 ? part.text : part.text.substring(0, wsIndex);
        pos = target.length;
        defaultDisplayText = target;
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
        part.text.substring(pos).trim() || defaultDisplayText || part.text;

    return part;
}
