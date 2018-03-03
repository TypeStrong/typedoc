"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommentTag = (function () {
    function CommentTag(tagName, paramName, text) {
        this.tagName = tagName;
        this.paramName = paramName || '';
        this.text = text || '';
    }
    CommentTag.prototype.toObject = function () {
        var result = {
            tag: this.tagName,
            text: this.text
        };
        if (this.paramName) {
            result.param = this.paramName;
        }
        return result;
    };
    return CommentTag;
}());
exports.CommentTag = CommentTag;
//# sourceMappingURL=tag.js.map