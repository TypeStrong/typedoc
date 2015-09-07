var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util = require("util");
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var MarkedPlugin_1 = require("./MarkedPlugin");
var MarkedLinksPlugin = (function (_super) {
    __extends(MarkedLinksPlugin, _super);
    function MarkedLinksPlugin(renderer) {
        _super.call(this, renderer);
        this.brackets = /\[\[([^\]]+)\]\]/g;
        this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
        this.urlPrefix = /^(http|ftp)s?:\/\//;
        renderer.on(MarkedPlugin_1.MarkedPlugin.EVENT_PARSE_MARKDOWN, this.onParseMarkdown, this, 100);
    }
    MarkedLinksPlugin.prototype.replaceBrackets = function (text) {
        var _this = this;
        return text.replace(this.brackets, function (match, content) {
            var split = MarkedLinksPlugin.splitLinkText(content);
            return _this.buildLink(match, split.target, split.caption);
        });
    };
    MarkedLinksPlugin.prototype.replaceInlineTags = function (text) {
        var _this = this;
        return text.replace(this.inlineTag, function (match, leading, tagName, content) {
            var split = MarkedLinksPlugin.splitLinkText(content);
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
    MarkedLinksPlugin.prototype.buildLink = function (original, target, caption, monospace) {
        var attributes = '';
        if (this.urlPrefix.test(target)) {
            attributes = ' class="external"';
        }
        else {
            var reflection;
            if (this.reflection) {
                reflection = this.reflection.findReflectionByName(target);
            }
            else if (this.project) {
                reflection = this.project.findReflectionByName(target);
            }
            if (reflection && reflection.url) {
                target = this.getRelativeUrl(reflection.url);
            }
            else {
                return original;
            }
        }
        if (monospace) {
            caption = '<code>' + caption + '</code>';
        }
        return Util.format('<a href="%s"%s>%s</a>', target, attributes, caption);
    };
    MarkedLinksPlugin.prototype.onParseMarkdown = function (event) {
        event.parsedText = this.replaceInlineTags(this.replaceBrackets(event.parsedText));
    };
    MarkedLinksPlugin.splitLinkText = function (text) {
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
    return MarkedLinksPlugin;
})(RendererPlugin_1.ContextAwareRendererPlugin);
exports.MarkedLinksPlugin = MarkedLinksPlugin;
Renderer_1.Renderer.registerPlugin('markedLinks', MarkedLinksPlugin);
