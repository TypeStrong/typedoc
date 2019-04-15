import { CommentTag } from './tag';
export declare class Comment {
    shortText: string;
    text: string;
    returns?: string;
    tags?: CommentTag[];
    constructor(shortText?: string, text?: string);
    hasVisibleComponent(): boolean;
    hasTag(tagName: string): boolean;
    getTag(tagName: string, paramName?: string): CommentTag | undefined;
    copyFrom(comment: Comment): void;
    toObject(): any;
}
