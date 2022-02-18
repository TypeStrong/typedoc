import { Comment, CommentDisplayPart, CommentTag } from "../../models";

import { SerializerComponent } from "../components";
import type {
    Comment as JSONComment,
    CommentTag as JSONCommentTag,
    CommentDisplayPart as JSONCommentDisplayPart,
} from "../schema";

function serializeDisplayPart(
    part: CommentDisplayPart
): JSONCommentDisplayPart {
    switch (part.kind) {
        case "text":
        case "code":
            return part;
        case "inline-tag": {
            let target: string | number | undefined = undefined;
            if (typeof part.target === "string") {
                target = part.target;
            } else if (typeof part.target === "object") {
                target = part.target.id;
            }
            return {
                ...part,
                target,
            };
        }
    }
}

export class CommentSerializer extends SerializerComponent<Comment> {
    static override PRIORITY = 1000;

    /**
     * Filter for instances of {@link Comment}
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof Comment;
    }

    supports() {
        return true;
    }

    toObject(comment: Comment, obj: Partial<JSONComment> = {}): JSONComment {
        const result: JSONComment = {
            ...obj,
            summary: comment.summary.map(serializeDisplayPart),
        };
        if (comment.blockTags.length) {
            result.blockTags = comment.blockTags.map((tag) =>
                this.owner.toObject(tag)
            );
        }
        if (comment.modifierTags.size) {
            result.modifierTags = Array.from(comment.modifierTags);
        }

        return result;
    }
}

export class CommentTagSerializer extends SerializerComponent<CommentTag> {
    static override PRIORITY = 1000;

    /**
     * Filter for instances of {@link CommentTag}
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof CommentTag;
    }

    supports(_t: unknown) {
        return true;
    }

    toObject(
        tag: CommentTag,
        obj: Partial<JSONCommentTag> = {}
    ): JSONCommentTag {
        const result: JSONCommentTag = {
            tag: tag.tag,
            content: tag.content.map(serializeDisplayPart),
        };

        if (tag.name) {
            result.name = tag.name;
        }

        return Object.assign(obj, result);
    }
}
