import { Comment } from "../../../models";

import { SerializerComponent } from "../../components";
import { Comment as JSONComment } from "../../schema";

export class CommentSerializer extends SerializerComponent<Comment> {
    static override PRIORITY = 1000;

    /**
     * Filter for instances of [[Comment]]
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof Comment;
    }

    supports() {
        return true;
    }

    toObject(comment: Comment, obj: Partial<JSONComment> = {}): JSONComment {
        if (comment.shortText) {
            obj.shortText = comment.shortText;
        }
        if (comment.text) {
            obj.text = comment.text;
        }
        if (comment.returns) {
            obj.returns = comment.returns;
        }
        if (comment.tags.length) {
            obj.tags = comment.tags.map((tag) => this.owner.toObject(tag));
        }

        return obj;
    }

    override createFromObject(obj: JSONComment) {
        return new Comment(obj.shortText, obj.text);
    }
    override fromObject(comment: Comment, obj: JSONComment) {
        comment.returns = this.owner.fromObject(obj.returns);
        comment.tags = this.owner.fromObject(obj.tags);
    }
}
