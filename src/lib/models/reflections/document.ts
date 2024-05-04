import type { Deserializer, JSONOutput, Serializer } from "../../serialization";
import { Comment, type CommentDisplayPart } from "../comments";
import { Reflection, type TraverseCallback } from "./abstract";
import { ReflectionKind } from "./kind";

/**
 * Non-TS reflection type which is used to represent markdown documents included in the docs.
 */
export class DocumentReflection extends Reflection {
    override readonly variant = "document";

    /**
     * The content to be displayed on the page for this reflection.
     */
    content: CommentDisplayPart[];

    /**
     * Frontmatter included in document
     */
    frontmatter: Record<string, unknown>;

    /**
     * A precomputed boost derived from the searchCategoryBoosts and searchGroupBoosts options, used when
     * boosting search relevance scores at runtime. May be modified by plugins.
     */
    relevanceBoost?: number;

    constructor(
        name: string,
        parent: Reflection,
        content: CommentDisplayPart[],
        frontmatter: Record<string, unknown>,
    ) {
        super(name, ReflectionKind.Document, parent);
        this.content = content;
        this.frontmatter = frontmatter;

        if (typeof frontmatter["title"] === "string") {
            this.name = frontmatter["title"];
            delete frontmatter["title"];
        }
    }

    override isDocument(): this is DocumentReflection {
        return true;
    }

    override traverse(_callback: TraverseCallback): void {
        // Nothing to do here, we have no children.
    }

    override toObject(serializer: Serializer): JSONOutput.DocumentReflection {
        return {
            ...super.toObject(serializer),
            variant: this.variant,
            content: Comment.serializeDisplayParts(serializer, this.content),
            frontmatter: this.frontmatter,
            relevanceBoost: this.relevanceBoost,
        };
    }

    override fromObject(de: Deserializer, obj: JSONOutput.DocumentReflection) {
        super.fromObject(de, obj);
        this.content = Comment.deserializeDisplayParts(de, obj.content);
        this.frontmatter = obj.frontmatter;
        this.relevanceBoost = obj.relevanceBoost;
    }
}
