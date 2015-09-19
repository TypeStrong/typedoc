var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Util = require("util");
var components_1 = require("../components");
var events_1 = require("../events");
var MarkedLinksPlugin = (function (_super) {
    __extends(MarkedLinksPlugin, _super);
    function MarkedLinksPlugin() {
        _super.apply(this, arguments);
        this.brackets = /\[\[([^\]]+)\]\]/g;
        this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
        this.urlPrefix = /^(http|ftp)s?:\/\//;
    }
    MarkedLinksPlugin.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.listenTo(this.owner, events_1.MarkdownEvent.PARSE, this.onParseMarkdown, 100);
    };
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
    MarkedLinksPlugin = __decorate([
        components_1.Component({ name: "marked-links" }), 
        __metadata('design:paramtypes', [])
    ], MarkedLinksPlugin);
    return MarkedLinksPlugin;
})(components_1.ContextAwareRendererComponent);
exports.MarkedLinksPlugin = MarkedLinksPlugin;
