import { CommentTag } from "../../../models";

import { SerializerComponent } from "../../components";
import { CommentTag as JSONCommentTag } from "../../schema";

export class CommentTagSerializer extends SerializerComponent<CommentTag> {
    static override PRIORITY = 1000;

    /**
     * Filter for instances of [[CommentTag]]
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
            tag: tag.tagName,
            text: tag.text,
        };

        if (tag.paramName) {
            result.param = tag.paramName;
        }

        return { ...obj, ...result };
    }

    override createFromObject(obj: JSONCommentTag) {
        return new CommentTag(obj.tag!, obj.param, obj.text);
    }
}
