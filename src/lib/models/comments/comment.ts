import { assertNever, removeIf } from "../../utils";

export type CommentDisplayPart =
    | { kind: "text"; text: string }
    | { kind: "code"; text: string }
    | { kind: "inline-tag"; tag: string; text: string };

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
     * If this is a `@param`, `@typeParam`, or `@template` tag, the parameter name associated with it.
     */
    paramName?: string;

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
        if (this.paramName) {
            tag.paramName = this.paramName;
        }
        return tag;
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
        const result: string[] = [];

        for (const item of parts || []) {
            switch (item.kind) {
                case "text":
                    result.push(item.text);
                    break;
                case "code":
                    result.push(item.text);
                    break;
                case "inline-tag":
                    result.push("{", item.tag, item.text, "}");
                    break;
                default:
                    assertNever(item);
            }
        }

        return result.join("");
    }

    /**
     * Helper utility to clone {@link Comment.summary} or {@link CommentTag.content}
     * @internal probably ok to expose, but waiting until someone asks.
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

    getParamTag(param: string, tagName: `@${string}` = "@param") {
        return this.blockTags.find(
            (tag) => tag.tag === tagName && tag.paramName === param
        );
    }

    /**
     * Removes all tags with the given tag name from the comment.
     * @param tagName
     */
    removeTags(tagName: `@${string}`) {
        removeIf(this.blockTags, (tag) => tag.tag === tagName);
    }
}
