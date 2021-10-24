import { Comment } from "../../../models";

import { SerializerComponent } from "../../components";
import type { Comment as JSONComment } from "../../schema";

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
        obj.summary = comment.summary;
        if (comment.blockTags.length) {
            obj.blockTags = comment.blockTags.map((tag) =>
                this.owner.toObject(tag)
            );
        }
        if (comment.modifierTags.size) {
            obj.modifierTags = Array.from(comment.modifierTags);
        }
        return obj;
    }
}
