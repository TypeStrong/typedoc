"use strict";
var tag_1 = require("./tag");
var Comment = (function () {
    function Comment(shortText, text) {
        this.shortText = shortText || '';
        this.text = text || '';
    }
    Comment.prototype.hasVisibleComponent = function () {
        return (!!this.shortText || !!this.text || !!this.tags);
    };
    Comment.prototype.hasTag = function (tagName) {
        if (!this.tags)
            return false;
        for (var i = 0, c = this.tags.length; i < c; i++) {
            if (this.tags[i].tagName == tagName) {
                return true;
            }
        }
        return false;
    };
    Comment.prototype.getTag = function (tagName, paramName) {
        if (!this.tags)
            return null;
        for (var i = 0, c = this.tags.length; i < c; i++) {
            var tag = this.tags[i];
            if (tag.tagName == tagName && (paramName == void 0 || tag.paramName == paramName)) {
                return this.tags[i];
            }
        }
        return null;
    };
    Comment.prototype.copyFrom = function (comment) {
        this.shortText = comment.shortText;
        this.text = comment.text;
        this.returns = comment.returns;
        this.tags = comment.tags ? comment.tags.map(function (tag) { return new tag_1.CommentTag(tag.tagName, tag.paramName, tag.text); }) : null;
    };
    Comment.prototype.toObject = function () {
        var result = {};
        if (this.shortText)
            result.shortText = this.shortText;
        if (this.text)
            result.text = this.text;
        if (this.returns)
            result.returns = this.returns;
        if (this.tags && this.tags.length) {
            result.tags = [];
            this.tags.forEach(function (tag) { return result.tags.push(tag.toObject()); });
        }
        return result;
    };
    return Comment;
}());
exports.Comment = Comment;
//# sourceMappingURL=comment.js.map