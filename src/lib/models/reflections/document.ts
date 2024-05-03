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
     * A precomputed boost derived from the searchCategoryBoosts and searchGroupBoosts options, used when
     * boosting search relevance scores at runtime. May be modified by plugins.
     */
    relevanceBoost?: number;

    constructor(
        name: string,
        parent: Reflection,
        content: CommentDisplayPart[],
    ) {
        super(name, ReflectionKind.Document, parent);
        this.content = content;
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
            relevanceBoost: this.relevanceBoost,
        };
    }

    override fromObject(de: Deserializer, obj: JSONOutput.DocumentReflection) {
        super.fromObject(de, obj);
        this.content = Comment.deserializeDisplayParts(de, obj.content);
        this.relevanceBoost = obj.relevanceBoost;
    }
}
