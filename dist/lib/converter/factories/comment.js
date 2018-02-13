"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ts = require("../../ts-internal");
var index_1 = require("../../models/comments/index");
function createComment(node) {
    var comment = getRawComment(node);
    if (comment == null) {
        return null;
    }
    return parseComment(comment);
}
exports.createComment = createComment;
function isTopmostModuleDeclaration(node) {
    if (node.nextContainer && node.nextContainer.kind === ts.SyntaxKind.ModuleDeclaration) {
        var next = node.nextContainer;
        if (node.name.end + 1 === next.name.pos) {
            return false;
        }
    }
    return true;
}
function getRootModuleDeclaration(node) {
    while (node.parent && node.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
        var parent_1 = node.parent;
        if (node.name.pos === parent_1.name.end + 1) {
            node = parent_1;
        }
        else {
            break;
        }
    }
    return node;
}
function getRawComment(node) {
    if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
        node = node.parent.parent;
    }
    else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        if (!isTopmostModuleDeclaration(node)) {
            return null;
        }
        else {
            node = getRootModuleDeclaration(node);
        }
    }
    var sourceFile = _ts.getSourceFileOfNode(node);
    var comments = _ts.getJSDocCommentRanges(node, sourceFile.text);
    if (comments && comments.length) {
        var comment = void 0;
        if (node.kind === ts.SyntaxKind.SourceFile) {
            if (comments.length === 1) {
                return null;
            }
            comment = comments[0];
        }
        else {
            comment = comments[comments.length - 1];
        }
        return sourceFile.text.substring(comment.pos, comment.end);
    }
    else {
        return null;
    }
}
exports.getRawComment = getRawComment;
function parseComment(text, comment) {
    if (comment === void 0) { comment = new index_1.Comment(); }
    var currentTag;
    var shortText = 0;
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
        var tagName = tag[1].toLowerCase();
        var paramName;
        line = line.substr(tagName.length + 1).trim();
        if (tagName === 'return') {
            tagName = 'returns';
        }
        if (tagName === 'param' || tagName === 'typeparam') {
            line = consumeTypeData(line);
            var param = /[^\s]+/.exec(line);
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
    var CODE_FENCE = /^\s*```(?!.*```)/;
    var inCode = false;
    function readLine(line) {
        line = line.replace(/^\s*\*? ?/, '');
        line = line.replace(/\s*$/, '');
        if (CODE_FENCE.test(line)) {
            inCode = !inCode;
        }
        if (!inCode) {
            var tag = /^@(\S+)/.exec(line);
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