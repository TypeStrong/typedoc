import { Comment } from '../../models/comments/index';
import { Reflection, ProjectReflection } from '../../models/reflections/index';
import { ConverterComponent } from '../components';
export declare class CommentPlugin extends ConverterComponent {
    private comments;
    private hidden;
    initialize(): void;
    private storeModuleComment(comment, reflection);
    private applyModifiers(reflection, comment);
    private onBegin(context);
    private onCreateTypeParameter(context, reflection, node?);
    private onDeclaration(context, reflection, node?);
    private onFunctionImplementation(context, reflection, node?);
    private onBeginResolve(context);
    private onResolve(context, reflection);
    static removeTags(comment: Comment, tagName: string): void;
    static removeReflection(project: ProjectReflection, reflection: Reflection): void;
}
