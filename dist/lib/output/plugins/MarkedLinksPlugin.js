"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require("util");
var components_1 = require("../components");
var events_1 = require("../events");
var component_1 = require("../../utils/component");
var declaration_1 = require("../../utils/options/declaration");
var MarkedLinksPlugin = (function (_super) {
    __extends(MarkedLinksPlugin, _super);
    function MarkedLinksPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.brackets = /\[\[([^\]]+)\]\]/g;
        _this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
        _this.warnings = [];
        return _this;
    }
    MarkedLinksPlugin_1 = MarkedLinksPlugin;
    MarkedLinksPlugin.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.listenTo(this.owner, (_a = {},
            _a[events_1.MarkdownEvent.PARSE] = this.onParseMarkdown,
            _a[events_1.RendererEvent.END] = this.onEndRenderer,
            _a), null, 100);
        var _a;
    };
    MarkedLinksPlugin.prototype.replaceBrackets = function (text) {
        var _this = this;
        return text.replace(this.brackets, function (match, content) {
            var split = MarkedLinksPlugin_1.splitLinkText(content);
            return _this.buildLink(match, split.target, split.caption);
        });
    };
    MarkedLinksPlugin.prototype.replaceInlineTags = function (text) {
        var _this = this;
        return text.replace(this.inlineTag, function (match, leading, tagName, content) {
            var split = MarkedLinksPlugin_1.splitLinkText(content);
            var target = split.target;
            var caption = leading || split.caption;
            var monospace;
            if (tagName === 'linkcode') {
                monospace = true;
            }
            if (tagName === 'linkplain') {
                monospace = false;
            }
            return _this.buildLink(match, target, caption, monospace);
        });
    };
    MarkedLinksPlugin.prototype.buildLink = function (original, target, caption, monospace) {
        var attributes = '';
        if (this.urlPrefix.test(target)) {
            attributes = ' class="external"';
        }
        else {
            var reflection = void 0;
            if (this.reflection) {
                reflection = this.reflection.findReflectionByName(target);
            }
            else if (this.project) {
                reflection = this.project.findReflectionByName(target);
            }
            if (reflection && reflection.url) {
                if (this.urlPrefix.test(reflection.url)) {
                    target = reflection.url;
                    attributes = ' class="external"';
                }
                else {
                    target = this.getRelativeUrl(reflection.url);
                }
            }
            else {
                reflection = this.reflection || this.project;
                this.warnings.push("In " + reflection.getFullName() + ": " + original);
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
    MarkedLinksPlugin.prototype.onEndRenderer = function (event) {
        if (this.listInvalidSymbolLinks && this.warnings.length > 0) {
            this.application.logger.write('');
            this.application.logger.warn('[MarkedLinksPlugin]: Found invalid symbol reference(s) in JSDocs, ' +
                'they will not render as links in the generated documentation.');
            for (var _i = 0, _a = this.warnings; _i < _a.length; _i++) {
                var warning = _a[_i];
                this.application.logger.write('  ' + warning);
            }
        }
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
    __decorate([
        component_1.Option({
            name: 'listInvalidSymbolLinks',
            help: 'Emits a list of broken symbol [[navigation]] links after documentation generation',
            type: declaration_1.ParameterType.Boolean
        })
    ], MarkedLinksPlugin.prototype, "listInvalidSymbolLinks", void 0);
    MarkedLinksPlugin = MarkedLinksPlugin_1 = __decorate([
        components_1.Component({ name: 'marked-links' })
    ], MarkedLinksPlugin);
    return MarkedLinksPlugin;
    var MarkedLinksPlugin_1;
}(components_1.ContextAwareRendererComponent));
exports.MarkedLinksPlugin = MarkedLinksPlugin;
//# sourceMappingURL=MarkedLinksPlugin.js.map