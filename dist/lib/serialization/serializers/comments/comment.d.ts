import { Comment } from '../../../models';
import { SerializerComponent } from '../../components';
export declare class CommentSerializer extends SerializerComponent<Comment> {
    static PRIORITY: number;
    protected static serializeGroup(instance: any): boolean;
    serializeGroup: typeof CommentSerializer.serializeGroup;
    serializeGroupSymbol: typeof Comment;
    initialize(): void;
    toObject(comment: Comment, obj?: any): any;
}
