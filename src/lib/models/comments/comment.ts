import { assertNever, removeIf } from "../../utils";
import type { Reflection } from "../reflections";

import type { Serializer, JSONOutput } from "../../serialization";

export type CommentDisplayPart =
    | { kind: "text"; text: string }
    | { kind: "code"; text: string }
    | InlineTagDisplayPart;

/**
 * The `@link`, `@linkcode`, and `@linkplain` tags may have a `target`
 * property set indicating which reflection/url they link to.
 */
export interface InlineTagDisplayPart {
    kind: "inline-tag";
    tag: `@${string}`;
    text: string;
    target?: Reflection | string;
}

function serializeDisplayPart(
    part: CommentDisplayPart
): JSONOutput.CommentDisplayPart {
    switch (part.kind) {
        case "text":
        case "code":
            return part;
        case "inline-tag": {
            return {
                ...part,
                target:
                    typeof part.target === "object"
                        ? part.target.id
                        : part.target,
            };
        }
    }
}

/**
 * A model that represents a single TypeDoc comment tag.
 *
 * Tags are stored in the {@link Comment.blockTags} property.
 */
export class CommentTag {
    /**
     * The name of this tag, e.g. `@returns`, `@example`
     */
    tag: `@${string}`;

    /**
     * Some tags, (`@typedef`, `@param`, `@property`, etc.) may have a user defined identifier associated with them.
     * If this tag is one of those, it will be parsed out and included here.
     */
    name?: string;

    /**
     * The actual body text of this tag.
     */
    content: CommentDisplayPart[];

    /**
     * Create a new CommentTag instance.
     */
    constructor(tag: `@${string}`, text: CommentDisplayPart[]) {
        this.tag = tag;
        this.content = text;
    }

    clone(): CommentTag {
        const tag = new CommentTag(
            this.tag,
            Comment.cloneDisplayParts(this.content)
        );
        if (this.name) {
            tag.name = this.name;
        }
        return tag;
    }

    toObject(): JSONOutput.CommentTag {
        return {
            tag: this.tag,
            name: this.name,
            content: this.content.map(serializeDisplayPart),
        };
    }
}

/**
 * A model that represents a comment.
 *
 * Instances of this model are created by the CommentPlugin. You can retrieve comments
 * through the {@link DeclarationReflection.comment} property.
 */
export class Comment {
    /**
     * Debugging utility for combining parts into a simple string. Not suitable for
     * rendering, but can be useful in tests.
     */
    static combineDisplayParts(
        parts: readonly CommentDisplayPart[] | undefined
    ): string {
        let result = "";

        for (const item of parts || []) {
            switch (item.kind) {
                case "text":
                case "code":
                    result += item.text;
                    break;
                case "inline-tag":
                    result += `{${item.tag} ${item.text}}`;
                    break;
                default:
                    assertNever(item);
            }
        }

        return result;
    }

    /**
     * Helper function to convert an array of comment display parts into markdown suitable for
     * passing into Marked. `urlTo` will be used to resolve urls to any reflections linked to with
     * `@link` tags.
     */
    static displayPartsToMarkdown(
        parts: readonly CommentDisplayPart[],
        urlTo: (ref: Reflection) => string
    ) {
        const result: string[] = [];

        for (const part of parts) {
            switch (part.kind) {
                case "text":
                case "code":
                    result.push(part.text);
                    break;
                case "inline-tag":
                    switch (part.tag) {
                        case "@label":
                        case "@inheritdoc": // Shouldn't happen
                            break; // Not rendered.
                        case "@link":
                        case "@linkcode":
                        case "@linkplain": {
                            if (part.target) {
                                const url =
                                    typeof part.target === "string"
                                        ? part.target
                                        : urlTo(part.target);
                                const text =
                                    part.tag === "@linkcode"
                                        ? `<code>${part.text}</code>`
                                        : part.text;
                                result.push(
                                    url
                                        ? `<a href="${url}">${text}</a>`
                                        : part.text
                                );
                            } else {
                                result.push(part.text);
                            }
                            break;
                        }
                        default:
                            // Hmm... probably want to be able to render these somehow, so custom inline tags can be given
                            // special rendering rules. Future capability. For now, just render their text.
                            result.push(`{${part.tag} ${part.text}}`);
                            break;
                    }
                    break;
                default:
                    assertNever(part);
            }
        }

        return result.join("");
    }

    /**
     * Helper utility to clone {@link Comment.summary} or {@link CommentTag.content}
     */
    static cloneDisplayParts(parts: CommentDisplayPart[]) {
        return parts.map((p) => ({ ...p }));
    }

    /**
     * The content of the comment which is not associated with a block tag.
     */
    summary: CommentDisplayPart[];

    /**
     * All associated block level tags.
     */
    blockTags: CommentTag[] = [];

    /**
     * All modifier tags present on the comment, e.g. `@alpha`, `@beta`.
     */
    modifierTags: Set<string> = new Set<string>();

    /**
     * Creates a new Comment instance.
     */
    constructor(
        summary: CommentDisplayPart[] = [],
        blockTags: CommentTag[] = [],
        modifierTags: Set<string> = new Set()
    ) {
        this.summary = summary;
        this.blockTags = blockTags;
        this.modifierTags = modifierTags;
    }

    /**
     * Create a deep clone of this comment.
     */
    clone() {
        return new Comment(
            Comment.cloneDisplayParts(this.summary),
            this.blockTags.map((tag) => tag.clone()),
            new Set(this.modifierTags)
        );
    }

    /**
     * Returns true if this comment is completely empty.
     * @internal
     */
    isEmpty() {
        return !this.hasVisibleComponent() && this.modifierTags.size === 0;
    }

    /**
     * Has this comment a visible component?
     *
     * @returns TRUE when this comment has a visible component.
     */
    hasVisibleComponent(): boolean {
        return (
            this.summary.some((x) => x.kind !== "text" || x.text !== "") ||
            this.blockTags.length > 0
        );
    }

    /**
     * Test whether this comment contains a tag with the given name.
     *
     * @param tagName  The name of the tag to look for.
     * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
     */
    hasModifier(tagName: `@${string}`): boolean {
        return this.modifierTags.has(tagName);
    }

    removeModifier(tagName: `@${string}`) {
        this.modifierTags.delete(tagName);
    }

    /**
     * Return the first tag with the given name.
     *
     * @param tagName  The name of the tag to look for.
     * @param paramName  An optional parameter name to look for.
     * @returns The found tag or undefined.
     */
    getTag(tagName: `@${string}`): CommentTag | undefined {
        return this.blockTags.find((tag) => tag.tag === tagName);
    }

    /**
     * Get all tags with the given tag name.
     */
    getTags(tagName: `@${string}`): CommentTag[] {
        return this.blockTags.filter((tag) => tag.tag === tagName);
    }

    getIdentifiedTag(identifier: string, tagName: `@${string}`) {
        return this.blockTags.find(
            (tag) => tag.tag === tagName && tag.name === identifier
        );
    }

    /**
     * Removes all block tags with the given tag name from the comment.
     * @param tagName
     */
    removeTags(tagName: `@${string}`) {
        removeIf(this.blockTags, (tag) => tag.tag === tagName);
    }

    toObject(serializer: Serializer): JSONOutput.Comment {
        return {
            summary: this.summary.map(serializeDisplayPart),
            blockTags: serializer.toObjectsOptional(this.blockTags),
            modifierTags:
                this.modifierTags.size > 0
                    ? Array.from(this.modifierTags)
                    : undefined,
        };
    }
}
