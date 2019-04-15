import { Comment } from '../../../models';
import { SerializerComponent } from '../../components';
export declare class CommentSerializer extends SerializerComponent<Comment> {
    static PRIORITY: number;
    serializeGroup(instance: unknown): boolean;
    supports(t: unknown): boolean;
    serializeGroupSymbol: typeof Comment;
    toObject(comment: Comment, obj?: any): any;
}
