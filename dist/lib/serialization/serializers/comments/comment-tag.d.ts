import { CommentTag } from '../../../models';
import { SerializerComponent } from '../../components';
export declare class CommentTagSerializer extends SerializerComponent<CommentTag> {
    static PRIORITY: number;
    serializeGroup(instance: unknown): boolean;
    serializeGroupSymbol: typeof CommentTag;
    supports(t: unknown): boolean;
    toObject(tag: CommentTag, obj?: any): any;
}
