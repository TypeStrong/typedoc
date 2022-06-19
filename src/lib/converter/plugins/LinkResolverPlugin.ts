import type { Reflection } from "../../models/reflections/abstract";
import { Component, ConverterComponent } from "../components";
import type { Context } from "../../converter";
import { ConverterEvents } from "../converter-events";
import {
    CommentDisplayPart,
    ContainerReflection,
    DeclarationReflection,
    InlineTagDisplayPart,
    ReflectionKind,
} from "../../models";
import {
    ComponentPath,
    DeclarationReference,
    Meaning,
    MeaningKeyword,
    parseDeclarationReference,
} from "../comments/declarationReference";
import ts = require("typescript");
import { ok } from "assert";
import { BindOption, filterMap, ValidationOptions } from "../../utils";

const urlPrefix = /^(http|ftp)s?:\/\//;
const brackets = /\[\[([^\]]+)\]\]/g;
/**
 * A plugin that resolves `{@link Foo}` tags.
 */
@Component({ name: "link-resolver" })
export class LinkResolverPlugin extends ConverterComponent {
    @BindOption("validation")
    validation!: ValidationOptions;

    /**
     * Create a new LinkResolverPlugin instance.
     */
    override initialize() {
        super.initialize();
        this.owner.on(ConverterEvents.RESOLVE_END, this.onResolve, this, -300);
    }

    /**
     * Find all old style double bracket references to symbols within the given text and transform them into a link.
     *
     * @param text  The text that should be parsed.
     * @returns The text with symbol references replaced by links.
     */
    private replaceBrackets(
        reflection: Reflection,
        text: string
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

            const { target, caption } =
                LinkResolverPlugin.splitLinkText(content);

            if (!urlPrefix.test(target)) {
                const targetRefl = reflection.findReflectionByName(target);
                if (targetRefl) {
                    parts.push({
                        kind: "inline-tag",
                        tag: "@link",
                        text: caption,
                        target: targetRefl,
                    });
                } else {
                    this.application.logger.warn(
                        "Failed to find target: " + content
                    );
                    parts.push({
                        kind: "inline-tag",
                        tag: "@link",
                        text: content,
                    });
                }
            } else {
                parts.push({
                    kind: "inline-tag",
                    tag: "@link",
                    text: caption,
                    target,
                });
            }
        }
        parts.push({
            kind: "text",
            text: text.substring(begin),
        });

        return parts;
    }

    onResolve(context: Context) {
        for (const reflection of Object.values(context.project.reflections)) {
            this.processReflection(reflection);
        }

        let warned = false;
        const warn = () => {
            if (!warned) {
                warned = true;
                this.application.logger.warn(
                    `README: Comment [[target]] style links are deprecated and will be removed in 0.24`
                );
            }
        };

        if (context.project.readme) {
            context.project.readme = this.processParts(
                context.project,
                context.project.readme,
                warn
            );
        }
    }

    processReflection(reflection: Reflection) {
        const comment = reflection.comment;
        if (!comment) return;

        let warned = false;
        const warn = () => {
            if (!warned) {
                warned = true;
                this.application.logger.warn(
                    `${reflection.getFriendlyFullName()}: Comment [[target]] style links are deprecated and will be removed in 0.24`
                );
            }
        };

        comment.summary = this.processParts(reflection, comment.summary, warn);
        for (const tag of comment.blockTags) {
            tag.content = this.processParts(reflection, tag.content, warn);
        }
    }

    private processParts(
        reflection: Reflection,
        parts: CommentDisplayPart[],
        warn: () => void
    ): CommentDisplayPart[] {
        return parts.flatMap((part) =>
            this.processPart(reflection, part, warn)
        );
    }

    private processPart(
        reflection: Reflection,
        part: CommentDisplayPart,
        warn: () => void
    ): CommentDisplayPart | CommentDisplayPart[] {
        if (part.kind === "text" && brackets.test(part.text)) {
            warn();
            return this.replaceBrackets(reflection, part.text);
        }

        if (part.kind === "inline-tag") {
            if (
                part.tag === "@link" ||
                part.tag === "@linkcode" ||
                part.tag === "@linkplain"
            ) {
                return resolveLinkTag(reflection, part, (msg: string) => {
                    if (this.validation.invalidLink) {
                        this.application.logger.warn(msg);
                    }
                });
            }
        }

        return part;
    }

    /**
     * Split the given link into text and target at first pipe or space.
     *
     * @param text  The source string that should be checked for a split character.
     * @returns An object containing the link text and target.
     */
    static splitLinkText(text: string): { caption: string; target: string } {
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
}

function resolveLinkTag(
    reflection: Reflection,
    part: InlineTagDisplayPart,
    warn: (message: string) => void
) {
    let pos = 0;
    const end = part.text.length;

    // Skip any leading white space, which isn't allowed in a declaration reference.
    while (pos < end && ts.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
        pos++;
    }

    // Try to parse one
    const declRef = parseDeclarationReference(part.text, pos, end);

    let target: Reflection | undefined;
    if (declRef) {
        // Got one, great! Try to resolve the link
        target = resolveDeclarationReference(reflection, declRef[0]);
        pos = declRef[1];
    }

    // If resolution via a declaration reference failed, revert to the legacy "split and check"
    // method... this should go away in 0.24, once people have had a chance to migrate any failing links.
    if (!target) {
        warn(
            `Failed to resolve {@link ${
                part.text
            }} in ${reflection.getFriendlyFullName()} with declaration references. This link will break in v0.24.`
        );
        return legacyResolveLinkTag(reflection, part);
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
    part.text = part.text.substring(pos).trim() || target.name;

    return part;
}

function legacyResolveLinkTag(
    reflection: Reflection,
    part: InlineTagDisplayPart
) {
    const { caption, target } = LinkResolverPlugin.splitLinkText(part.text);

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

function resolveDeclarationReference(
    reflection: Reflection,
    ref: DeclarationReference
): Reflection | undefined {
    let high: Reflection[] = [];
    let low: Reflection[] = [];

    if (ref.moduleSource) {
        high =
            reflection.project.children?.filter(
                (c) =>
                    c.kindOf(ReflectionKind.SomeModule) &&
                    c.name === ref.moduleSource
            ) || [];
    } else if (ref.resolutionStart === "global") {
        high.push(reflection.project);
    } else {
        ok(ref.resolutionStart === "local");
        // TypeScript's behavior is to first try to resolve links via variable scope, and then
        // if the link still hasn't been found, check either siblings (if comment belongs to a member)
        // or otherwise children.
        let refl: Reflection | undefined = reflection;
        if (refl.kindOf(ReflectionKind.ExportContainer)) {
            high.push(refl);
        }
        while (refl.parent) {
            refl = refl.parent;
            if (refl.kindOf(ReflectionKind.ExportContainer)) {
                high.push(refl);
            }
        }

        if (reflection.kindOf(ReflectionKind.SomeMember)) {
            high.push(reflection.parent!);
        } else if (
            reflection.kindOf(ReflectionKind.SomeSignature) &&
            reflection.parent!.kindOf(ReflectionKind.SomeMember)
        ) {
            high.push(reflection.parent!.parent!);
        } else if (high[0] !== reflection) {
            high.push(reflection);
        }
    }

    if (ref.symbolReference) {
        for (const part of ref.symbolReference.path || []) {
            const high2 = high;
            high = [];
            const low2 = low;
            low = [];

            for (const refl of high2) {
                const resolved = resolveSymbolReferencePart(refl, part);
                high.push(...resolved.high);
                low.push(...resolved.low);
            }

            for (const refl of low2) {
                const resolved = resolveSymbolReferencePart(refl, part);
                low.push(...resolved.high);
                low.push(...resolved.low);
            }
        }

        if (ref.symbolReference.meaning) {
            high = filterMapByMeaning(high, ref.symbolReference.meaning);
            low = filterMapByMeaning(low, ref.symbolReference.meaning);
        }
    }

    return high[0] || low[0];
}

function filterMapByMeaning(
    reflections: Reflection[],
    meaning: Meaning
): Reflection[] {
    return filterMap(reflections, (refl): Reflection | undefined => {
        const kwResolved = resolveKeyword(refl, meaning.keyword) || [];
        return kwResolved[meaning.index || 0];
    });
}

function resolveKeyword(
    refl: Reflection,
    kw: MeaningKeyword | undefined
): Reflection[] | undefined {
    switch (kw) {
        case undefined:
            return [refl];
        case "class":
            if (refl.kindOf(ReflectionKind.Class)) return [refl];
            break;
        case "interface":
            if (refl.kindOf(ReflectionKind.Interface)) return [refl];
            break;
        case "type":
            if (refl.kindOf(ReflectionKind.SomeType)) return [refl];
            break;
        case "enum":
            if (refl.kindOf(ReflectionKind.Enum)) return [refl];
            break;
        case "namespace":
            if (refl.kindOf(ReflectionKind.SomeModule)) return [refl];
            break;
        case "function":
            if (refl.kindOf(ReflectionKind.FunctionOrMethod)) {
                return (refl as DeclarationReflection).signatures;
            }
            break;
        case "var":
            if (refl.kindOf(ReflectionKind.Variable)) return [refl];
            break;

        case "new":
        case "constructor":
            if (refl.kindOf(ReflectionKind.Class)) {
                const ctor = (refl as ContainerReflection).children?.find((c) =>
                    c.kindOf(ReflectionKind.Constructor)
                );
                return (ctor as DeclarationReflection)?.signatures;
            }
            if (refl.kindOf(ReflectionKind.Constructor)) {
                return (refl as DeclarationReflection).signatures;
            }
            break;

        case "member":
            if (refl.kindOf(ReflectionKind.SomeMember)) return [refl];
            break;
        case "event":
            if (refl.comment?.hasModifier("@event")) return [refl];
            break;
        case "call":
            return (refl as DeclarationReflection).signatures;

        case "index":
            if ((refl as DeclarationReflection).indexSignature) {
                return [(refl as DeclarationReflection).indexSignature!];
            }
            break;

        case "complex":
            if (refl.kindOf(ReflectionKind.SomeType)) return [refl];
            break;
    }
}

function resolveSymbolReferencePart(
    refl: Reflection,
    path: ComponentPath
): { high: Reflection[]; low: Reflection[] } {
    let high: Reflection[] = [];
    let low: Reflection[] = [];

    if (!(refl instanceof ContainerReflection) || !refl.children) {
        return { high, low };
    }

    switch (path.navigation) {
        // Grammar says resolve via "exports"... as always, reality is more complicated.
        // Check exports first, but also allow this as a general purpose "some child" operator
        // so that resolution doesn't behave very poorly with projects using JSDoc style resolution.
        // Also is more consistent with how TypeScript resolves link tags.
        case ".":
            high = refl.children.filter(
                (r) =>
                    r.name === path.path &&
                    (r.kindOf(ReflectionKind.SomeExport) || r.flags.isStatic)
            );
            low = refl.children.filter(
                (r) =>
                    r.name === path.path &&
                    (!r.kindOf(ReflectionKind.SomeExport) || !r.flags.isStatic)
            );
            break;

        // Resolve via "members", interface children, class instance properties/accessors/methods,
        // enum members, type literal properties
        case "#":
            high = refl.children.filter((r) => {
                return (
                    r.name === path.path &&
                    r.kindOf(ReflectionKind.SomeMember) &&
                    !r.flags.isStatic
                );
            });
            break;

        // Resolve via "locals"... treat this as a stricter `.` which only supports traversing
        // module/namespace exports since TypeDoc doesn't support documenting locals.
        case "~":
            if (
                refl.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)
            ) {
                high = refl.children.filter((r) => r.name === path.path);
            }
            break;
    }

    return { high, low };
}
