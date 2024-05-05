import ts from "typescript";
import {
    type Comment,
    type CommentDisplayPart,
    DeclarationReflection,
    type InlineTagDisplayPart,
    type Reflection,
    ReflectionSymbolId,
} from "../../models";
import {
    type DeclarationReference,
    parseDeclarationReference,
} from "./declarationReference";
import { resolveDeclarationReference } from "./declarationReferenceResolver";

const urlPrefix = /^(http|ftp)s?:\/\//;

export type ExternalResolveResult = { target: string; caption?: string };

/**
 * @param ref - Parsed declaration reference to resolve. This may be created automatically for some symbol, or
 *   parsed from user input.
 * @param refl - Reflection that contains the resolved link
 * @param part - If the declaration reference was created from a comment, the originating part.
 * @param symbolId - If the declaration reference was created from a symbol, or `useTsLinkResolution` is turned
 *   on and TypeScript resolved the link to some symbol, the ID of that symbol.
 */
export type ExternalSymbolResolver = (
    ref: DeclarationReference,
    refl: Reflection,
    part: Readonly<CommentDisplayPart> | undefined,
    symbolId: ReflectionSymbolId | undefined,
) => ExternalResolveResult | string | undefined;

export type LinkResolverOptions = {
    preserveLinkText: boolean;
};

export function resolveLinks(
    comment: Comment,
    reflection: Reflection,
    externalResolver: ExternalSymbolResolver,
    options: LinkResolverOptions,
) {
    comment.summary = resolvePartLinks(
        reflection,
        comment.summary,
        externalResolver,
        options,
    );
    for (const tag of comment.blockTags) {
        tag.content = resolvePartLinks(
            reflection,
            tag.content,
            externalResolver,
            options,
        );
    }

    if (reflection instanceof DeclarationReflection && reflection.readme) {
        reflection.readme = resolvePartLinks(
            reflection,
            reflection.readme,
            externalResolver,
            options,
        );
    }

    if (reflection.isDocument()) {
        reflection.content = resolvePartLinks(
            reflection,
            reflection.content,
            externalResolver,
            options,
        );
    }
}

export function resolvePartLinks(
    reflection: Reflection,
    parts: readonly CommentDisplayPart[],
    externalResolver: ExternalSymbolResolver,
    options: LinkResolverOptions,
): CommentDisplayPart[] {
    return parts.flatMap((part) =>
        processPart(reflection, part, externalResolver, options),
    );
}

function processPart(
    reflection: Reflection,
    part: CommentDisplayPart,
    externalResolver: ExternalSymbolResolver,
    options: LinkResolverOptions,
): CommentDisplayPart | CommentDisplayPart[] {
    if (part.kind === "inline-tag") {
        if (
            part.tag === "@link" ||
            part.tag === "@linkcode" ||
            part.tag === "@linkplain"
        ) {
            return resolveLinkTag(reflection, part, externalResolver, options);
        }
    }

    return part;
}

function resolveLinkTag(
    reflection: Reflection,
    part: InlineTagDisplayPart,
    externalResolver: ExternalSymbolResolver,
    options: LinkResolverOptions,
): InlineTagDisplayPart {
    let defaultDisplayText = "";
    let pos = 0;
    const end = part.text.length;
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }

    let target: Reflection | string | undefined;
    // Try to parse a declaration reference if we didn't use the TS symbol for resolution
    const declRef = parseDeclarationReference(part.text, pos, end);

    // Might already know where it should go if useTsLinkResolution is turned on
    if (part.target instanceof ReflectionSymbolId) {
        const tsTarget = reflection.project.getReflectionFromSymbolId(
            part.target,
        );

        if (tsTarget) {
            target = tsTarget;
            pos = end;
            defaultDisplayText =
                part.tsLinkText ||
                (options.preserveLinkText ? part.text : target.name);
        } else if (declRef) {
            // If we didn't find a target, we might be pointing to a symbol in another project that will be merged in
            // or some external symbol, so ask external resolvers to try resolution. Don't use regular declaration ref
            // resolution in case it matches something that would have been merged in later.

            const externalResolveResult = externalResolver(
                declRef[0],
                reflection,
                part,
                part.target instanceof ReflectionSymbolId
                    ? part.target
                    : undefined,
            );

            defaultDisplayText = options.preserveLinkText
                ? part.text
                : part.text.substring(0, pos);

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

    if (!target && declRef) {
        // Got one, great! Try to resolve the link
        target = resolveDeclarationReference(reflection, declRef[0]);
        pos = declRef[1];

        if (target) {
            defaultDisplayText = options.preserveLinkText
                ? part.text
                : target.name;
        } else {
            // If we didn't find a link, it might be a @link tag to an external symbol, check that next.
            const externalResolveResult = externalResolver(
                declRef[0],
                reflection,
                part,
                part.target instanceof ReflectionSymbolId
                    ? part.target
                    : undefined,
            );

            defaultDisplayText = options.preserveLinkText
                ? part.text
                : part.text.substring(0, pos);

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
