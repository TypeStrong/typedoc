import { Comment } from '../../models/comments/index';
import { Reflection, ProjectReflection } from '../../models/reflections/index';
import { ConverterComponent } from '../components';
export declare class CommentPlugin extends ConverterComponent {
    private comments;
    private hidden?;
    initialize(): void;
    private storeModuleComment;
    private applyModifiers;
    private onBegin;
    private onCreateTypeParameter;
    private onDeclaration;
    private onFunctionImplementation;
    private onBeginResolve;
    private onResolve;
    static removeTags(comment: Comment | undefined, tagName: string): void;
    static removeReflections(project: ProjectReflection, reflections: Reflection[]): void;
    static removeReflection(project: ProjectReflection, reflection: Reflection, deletedIds?: number[]): void;
}
