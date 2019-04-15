import * as ts from 'typescript';
import { Comment } from '../../models/comments/index';
export declare function createComment(node: ts.Node): Comment | undefined;
export declare function getRawComment(node: ts.Node): string | undefined;
export declare function parseComment(text: string, comment?: Comment): Comment;
