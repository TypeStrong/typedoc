"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommentTag {
    constructor(tagName, paramName, text) {
        this.tagName = tagName;
        this.paramName = paramName || '';
        this.text = text || '';
    }
    toObject() {
        const result = {
            tag: this.tagName,
            text: this.text
        };
        if (this.paramName) {
            result.param = this.paramName;
        }
        return result;
    }
}
exports.CommentTag = CommentTag;
//# sourceMappingURL=tag.js.map