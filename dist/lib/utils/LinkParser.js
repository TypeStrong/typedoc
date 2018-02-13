"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require("util");
var LinkParser = (function () {
    function LinkParser(project, linkPrefix) {
        this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
        this.urlPrefix = /^(http|ftp)s?:\/\//;
        this.project = project;
        this.linkPrefix = linkPrefix != null ? linkPrefix : '';
    }
    LinkParser.prototype.replaceInlineTags = function (text) {
        var _this = this;
        var that = this;
        return text.replace(this.inlineTag, function (match, leading, tagName, content) {
            var split = that.splitLinkText(content);
            var target = split.target;
            var caption = leading || split.caption;
            var monospace;
            if (tagName == 'linkcode')
                monospace = true;
            if (tagName == 'linkplain')
                monospace = false;
            return _this.buildLink(match, target, caption, monospace);
        });
    };
    LinkParser.prototype.buildLink = function (original, target, caption, monospace) {
        var attributes = '';
        if (this.urlPrefix.test(target)) {
            attributes = ' class="external"';
        }
        else {
            var reflection = void 0;
            reflection = this.project.findReflectionByName(target);
            if (reflection && reflection.url) {
                target = reflection.url;
            }
            else {
                return caption;
            }
        }
        if (monospace) {
            caption = '<code>' + caption + '</code>';
        }
        return Util.format('<a href="%s%s"%s>%s</a>', this.linkPrefix, target, attributes, caption);
    };
    LinkParser.prototype.parseMarkdown = function (text) {
        return this.replaceInlineTags(text);
    };
    LinkParser.prototype.splitLinkText = function (text) {
        var splitIndex = text.indexOf('|');
        if (splitIndex === -1) {
            splitIndex = text.search(/\s/);
        }
        if (splitIndex !== -1) {
            return {
                caption: text.substr(splitIndex + 1).replace(/\n+/, ' '),
                target: text.substr(0, splitIndex)
            };
        }
        else {
            return {
                caption: text,
                target: text
            };
        }
    };
    return LinkParser;
}());
exports.LinkParser = LinkParser;
//# sourceMappingURL=LinkParser.js.map