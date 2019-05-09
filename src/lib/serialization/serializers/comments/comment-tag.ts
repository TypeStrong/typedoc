import { CommentTag } from '../../../models';

import { SerializerComponent } from '../../components';
import { JSONOutput } from '../../schema';

export class CommentTagSerializer extends SerializerComponent<CommentTag> {
    static PRIORITY = 1000;

    /**
     * Filter for instances of [[CommentTag]]
     */
    serializeGroup(instance: unknown): boolean {
        return instance instanceof CommentTag;
    }

    supports(t: unknown) {
        return true;
    }

    toObject(tag: CommentTag, obj: Partial<JSONOutput.CommentTag> = {}): JSONOutput.CommentTag {
        const result: JSONOutput.CommentTag = {
            tag: tag.tagName,
            text: tag.text
        };

        if (tag.paramName) {
            result.param = tag.paramName;
        }

        return { ...obj, ...result };
    }
}
