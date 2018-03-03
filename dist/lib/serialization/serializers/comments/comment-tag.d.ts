import { CommentTag } from '../../../models';
import { SerializerComponent } from '../../components';
export declare class CommentTagSerializer extends SerializerComponent<CommentTag> {
    static PRIORITY: number;
    protected static serializeGroup(instance: any): boolean;
    serializeGroup: typeof CommentTagSerializer.serializeGroup;
    serializeGroupSymbol: typeof CommentTag;
    initialize(): void;
    toObject(tag: CommentTag, obj?: any): any;
}
