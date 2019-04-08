import * as ts from 'typescript';
import { toArray } from 'lodash';

import { Comment, CommentTag } from '../../models/comments/index';

/**
 * Return the parsed comment of the given TypeScript node.
 *
 * @param node  The node whose comment should be returned.
 * @return The parsed comment as a [[Comment]] instance or undefined if no comment is present.
 */
export function createComment(node: ts.Node): Comment | undefined {
    const comment = getRawComment(node);
    if (!comment) {
        return;
    }

    return parseComment(comment);
}

/**
 * Check whether the given module declaration is the topmost.
 *
 * This function returns TRUE if there is no trailing module defined, in
 * the following example this would be the case only for module <code>C</code>.
 *
 * ```
 * module A.B.C { }
 * ```
 *
 * @param node  The module definition that should be tested.
 * @return TRUE if the given node is the topmost module declaration, FALSE otherwise.
 */
function isTopmostModuleDeclaration(node: ts.ModuleDeclaration): boolean {
    return node.getChildren().some(ts.isModuleBlock);
}

/**
 * Return the root module declaration of the given module declaration.
 *
 * In the following example this function would always return module
 * <code>A</code> no matter which of the modules was passed in.
 *
 * ```
 * module A.B.C { }
 * ```
 */
function getRootModuleDeclaration(node: ts.ModuleDeclaration): ts.Node {
    while (node.parent && node.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
        let parent = <ts.ModuleDeclaration> node.parent;
        if (node.name.pos === parent.name.end + 1) {
            node = parent;
        } else {
            break;
        }
    }

    return node;
}

/**
 * Derived from the internal ts utility
 * https://github.com/Microsoft/TypeScript/blob/v3.2.2/src/compiler/utilities.ts#L954
 * @param node
 * @param text
 */
function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
    const hasTrailingCommentRanges = [
        ts.SyntaxKind.Parameter,
        ts.SyntaxKind.FunctionExpression,
        ts.SyntaxKind.ArrowFunction,
        ts.SyntaxKind.ParenthesizedExpression
    ].includes(node.kind);

    let commentRanges = toArray(ts.getLeadingCommentRanges(text, node.pos));
    if (hasTrailingCommentRanges) {
        commentRanges = toArray(ts.getTrailingCommentRanges(text, node.pos)).concat(commentRanges);
    }

    // True if the comment starts with '/**' but not if it is '/**/'
    return commentRanges.filter(({ pos }) => text.substr(pos, 3) === '/**' && text[pos + 4] !== '/');
}

/**
 * Return the raw comment string for the given node.
 *
 * @param node  The node whose comment should be resolved.
 * @returns     The raw comment string or undefined if no comment could be found.
 */
export function getRawComment(node: ts.Node): string | undefined {
    if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
        node = node.parent.parent;
    } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        if (!isTopmostModuleDeclaration(<ts.ModuleDeclaration> node)) {
            return;
        } else {
            node = getRootModuleDeclaration(<ts.ModuleDeclaration> node);
        }
    }

    const sourceFile = node.getSourceFile();
    const comments = getJSDocCommentRanges(node, sourceFile.text);
    if (comments.length) {
        let comment: ts.CommentRange;
        if (node.kind === ts.SyntaxKind.SourceFile) {
            if (comments.length === 1) {
                return;
            }
            comment = comments[0];
        } else {
            comment = comments[comments.length - 1];
        }

        return sourceFile.text.substring(comment.pos, comment.end);
    } else {
        return;
    }
}

/**
 * Parse the given doc comment string.
 *
 * @param text     The doc comment string that should be parsed.
 * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
 * @returns        A populated [[Models.Comment]] instance.
 */
export function parseComment(text: string, comment: Comment = new Comment()): Comment {
    let currentTag: CommentTag;
    let shortText = 0;

    function consumeTypeData(line: string): string {
        line = line.replace(/^\{[^\}]*\}+/, '');
        line = line.replace(/^\[[^\[][^\]]*\]+/, '');
        return line.trim();
    }

    function readBareLine(line: string) {
        if (currentTag) {
            currentTag.text += '\n' + line;
        } else if (line === '' && shortText === 0) {
            // Ignore
        } else if (line === '' && shortText === 1) {
            shortText = 2;
        } else {
            if (shortText === 2) {
                comment.text += (comment.text === '' ? '' : '\n') + line;
            } else {
                comment.shortText += (comment.shortText === '' ? '' : '\n') + line;
                shortText = 1;
            }
        }
    }

    function readTagLine(line: string, tag: RegExpExecArray) {
        let tagName = tag[1].toLowerCase();
        let paramName: string | undefined;
        line = line.substr(tagName.length + 1).trim();

        if (tagName === 'return') { tagName = 'returns'; }
        if (tagName === 'param' || tagName === 'typeparam') {
            line = consumeTypeData(line);
            const param = /[^\s]+/.exec(line);
            if (param) {
                paramName = param[0];
                line = line.substr(paramName.length + 1).trim();
            }
            line = consumeTypeData(line);
            line = line.replace(/^\-\s+/, '');
        } else if (tagName === 'returns') {
            line = consumeTypeData(line);
        }

        currentTag = new CommentTag(tagName, paramName, line);
        if (!comment.tags) { comment.tags = []; }
        comment.tags.push(currentTag);
    }

    const CODE_FENCE = /^\s*```(?!.*```)/;
    let inCode = false;
    function readLine(line: string) {
        line = line.replace(/^\s*\*? ?/, '');
        line = line.replace(/\s*$/, '');

        if (CODE_FENCE.test(line) ) {
          inCode = !inCode;
        }

        if (!inCode) {
          const tag = /^@(\S+)/.exec(line);
          if (tag) {
            return readTagLine(line, tag);
          }
        }
        readBareLine(line);
    }

    text = text.replace(/^\s*\/\*+/, '');
    text = text.replace(/\*+\/\s*$/, '');
    text.split(/\r\n?|\n/).forEach(readLine);

    return comment;
}
