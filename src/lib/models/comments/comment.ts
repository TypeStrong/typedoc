import { assertNever, removeIf } from "../../utils";
import type { Reflection } from "../reflections";

import type { Serializer, Deserializer, JSONOutput } from "../../serialization";

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
            content: Comment.serializeDisplayParts(this.content),
        };
    }

    fromObject(de: Deserializer, obj: JSONOutput.CommentTag) {
        // tag already set by Comment.fromObject
        this.name = obj.name;
        this.content = Comment.deserializeDisplayParts(de, obj.content);
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
     * Helper utility to clone {@link Comment.summary} or {@link CommentTag.content}
     */
    static cloneDisplayParts(parts: CommentDisplayPart[]) {
        return parts.map((p) => ({ ...p }));
    }

    //Since display parts are plain objects, this lives here
    static serializeDisplayParts(
        parts: CommentDisplayPart[]
    ): JSONOutput.CommentDisplayPart[];
    /** @hidden no point in showing this signature in api docs */
    static serializeDisplayParts(
        parts: CommentDisplayPart[] | undefined
    ): JSONOutput.CommentDisplayPart[] | undefined;
    static serializeDisplayParts(
        parts: CommentDisplayPart[] | undefined
    ): JSONOutput.CommentDisplayPart[] | undefined {
        return parts?.map((part) => {
            switch (part.kind) {
                case "text":
                case "code":
                    return { ...part };
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
        });
    }

    //Since display parts are plain objects, this lives here
    static deserializeDisplayParts(
        de: Deserializer,
        parts: JSONOutput.CommentDisplayPart[]
    ): CommentDisplayPart[] {
        const links: [number, InlineTagDisplayPart][] = [];

        const result = parts.map((part): CommentDisplayPart => {
            switch (part.kind) {
                case "text":
                case "code":
                    return { ...part };
                case "inline-tag": {
                    if (typeof part.target !== "number") {
                        // TS isn't quite smart enough here...
                        return { ...part } as CommentDisplayPart;
                    } else {
                        const part2 = {
                            kind: part.kind,
                            tag: part.tag,
                            text: part.text,
                        };
                        links.push([part.target, part2]);
                        return part2;
                    }
                }
            }
        });

        if (links.length) {
            de.defer((project) => {
                for (const [oldId, part] of links) {
                    part.target = project.getReflectionById(
                        de.oldIdToNewId[oldId] || -1
                    );
                    if (!part.target) {
                        de.logger.warn(
                            `Serialized project contained a link to ${oldId} (${part.text}), which was not a part of the project.`
                        );
                    }
                }
            });
        }

        return result;
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
     * Label associated with this reflection, if any (https://tsdoc.org/pages/tags/label/)
     * Added by the CommentPlugin during resolution.
     */
    label?: string;

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
        extractLabelTag(this);
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
            summary: Comment.serializeDisplayParts(this.summary),
            blockTags: serializer.toObjectsOptional(this.blockTags),
            modifierTags:
                this.modifierTags.size > 0
                    ? Array.from(this.modifierTags)
                    : undefined,
            label: this.label,
        };
    }

    fromObject(de: Deserializer, obj: JSONOutput.Comment) {
        this.summary = Comment.deserializeDisplayParts(de, obj.summary);
        this.blockTags =
            obj.blockTags?.map((tagObj) => {
                const tag = new CommentTag(tagObj.tag, []);
                de.fromObject(tag, tagObj);
                return tag;
            }) || [];
        this.modifierTags = new Set(obj.modifierTags);
        this.label = obj.label;
    }
}

function extractLabelTag(comment: Comment) {
    const index = comment.summary.findIndex(
        (part) => part.kind === "inline-tag" && part.tag === "@label"
    );

    if (index !== -1) {
        comment.label = comment.summary.splice(index, 1)[0].text;
    }
}
