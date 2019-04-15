"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const lodash_1 = require("lodash");
const index_1 = require("../../models/comments/index");
function createComment(node) {
    const comment = getRawComment(node);
    if (!comment) {
        return;
    }
    return parseComment(comment);
}
exports.createComment = createComment;
function isTopmostModuleDeclaration(node) {
    return node.getChildren().some(ts.isModuleBlock);
}
function getRootModuleDeclaration(node) {
    while (node.parent && node.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
        let parent = node.parent;
        if (node.name.pos === parent.name.end + 1) {
            node = parent;
        }
        else {
            break;
        }
    }
    return node;
}
function getJSDocCommentRanges(node, text) {
    const hasTrailingCommentRanges = [
        ts.SyntaxKind.Parameter,
        ts.SyntaxKind.FunctionExpression,
        ts.SyntaxKind.ArrowFunction,
        ts.SyntaxKind.ParenthesizedExpression
    ].includes(node.kind);
    let commentRanges = lodash_1.toArray(ts.getLeadingCommentRanges(text, node.pos));
    if (hasTrailingCommentRanges) {
        commentRanges = lodash_1.toArray(ts.getTrailingCommentRanges(text, node.pos)).concat(commentRanges);
    }
    return commentRanges.filter(({ pos }) => text.substr(pos, 3) === '/**' && text[pos + 4] !== '/');
}
function getRawComment(node) {
    if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
        node = node.parent.parent;
    }
    else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        if (!isTopmostModuleDeclaration(node)) {
            return;
        }
        else {
            node = getRootModuleDeclaration(node);
        }
    }
    const sourceFile = node.getSourceFile();
    const comments = getJSDocCommentRanges(node, sourceFile.text);
    if (comments.length) {
        let comment;
        if (node.kind === ts.SyntaxKind.SourceFile) {
            if (comments.length === 1) {
                return;
            }
            comment = comments[0];
        }
        else {
            comment = comments[comments.length - 1];
        }
        return sourceFile.text.substring(comment.pos, comment.end);
    }
    else {
        return;
    }
}
exports.getRawComment = getRawComment;
function parseComment(text, comment = new index_1.Comment()) {
    let currentTag;
    let shortText = 0;
    function consumeTypeData(line) {
        line = line.replace(/^\{[^\}]*\}+/, '');
        line = line.replace(/^\[[^\[][^\]]*\]+/, '');
        return line.trim();
    }
    function readBareLine(line) {
        if (currentTag) {
            currentTag.text += '\n' + line;
        }
        else if (line === '' && shortText === 0) {
        }
        else if (line === '' && shortText === 1) {
            shortText = 2;
        }
        else {
            if (shortText === 2) {
                comment.text += (comment.text === '' ? '' : '\n') + line;
            }
            else {
                comment.shortText += (comment.shortText === '' ? '' : '\n') + line;
                shortText = 1;
            }
        }
    }
    function readTagLine(line, tag) {
        let tagName = tag[1].toLowerCase();
        let paramName;
        line = line.substr(tagName.length + 1).trim();
        if (tagName === 'return') {
            tagName = 'returns';
        }
        if (tagName === 'param' || tagName === 'typeparam') {
            line = consumeTypeData(line);
            const param = /[^\s]+/.exec(line);
            if (param) {
                paramName = param[0];
                line = line.substr(paramName.length + 1).trim();
            }
            line = consumeTypeData(line);
            line = line.replace(/^\-\s+/, '');
        }
        else if (tagName === 'returns') {
            line = consumeTypeData(line);
        }
        currentTag = new index_1.CommentTag(tagName, paramName, line);
        if (!comment.tags) {
            comment.tags = [];
        }
        comment.tags.push(currentTag);
    }
    const CODE_FENCE = /^\s*```(?!.*```)/;
    let inCode = false;
    function readLine(line) {
        line = line.replace(/^\s*\*? ?/, '');
        line = line.replace(/\s*$/, '');
        if (CODE_FENCE.test(line)) {
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
exports.parseComment = parseComment;
//# sourceMappingURL=comment.js.map