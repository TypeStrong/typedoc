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
var FS = require("fs-extra");
var Path = require("path");
var Marked = require("marked");
var HighlightJS = require("highlight.js");
var Handlebars = require("handlebars");
var components_1 = require("../components");
var events_1 = require("../events");
var component_1 = require("../../utils/component");
var declaration_1 = require("../../utils/options/declaration");
var MarkedPlugin = (function (_super) {
    __extends(MarkedPlugin, _super);
    function MarkedPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.includePattern = /\[\[include:([^\]]+?)\]\]/g;
        _this.mediaPattern = /media:\/\/([^ "\)\]\}]+)/g;
        return _this;
    }
    MarkedPlugin.prototype.initialize = function () {
        var _this = this;
        _super.prototype.initialize.call(this);
        this.listenTo(this.owner, events_1.MarkdownEvent.PARSE, this.onParseMarkdown);
        var that = this;
        Handlebars.registerHelper('markdown', function (arg) { return that.parseMarkdown(arg.fn(this), this); });
        Handlebars.registerHelper('relativeURL', function (url) { return url ? _this.getRelativeUrl(url) : url; });
        Marked.setOptions({
            highlight: function (text, lang) { return _this.getHighlighted(text, lang); }
        });
    };
    MarkedPlugin.prototype.getHighlighted = function (text, lang) {
        try {
            if (lang) {
                return HighlightJS.highlight(lang, text).value;
            }
            else {
                return HighlightJS.highlightAuto(text).value;
            }
        }
        catch (error) {
            this.application.logger.warn(error.message);
            return text;
        }
    };
    MarkedPlugin.prototype.parseMarkdown = function (text, context) {
        var _this = this;
        if (this.includes) {
            text = text.replace(this.includePattern, function (match, path) {
                path = Path.join(_this.includes, path.trim());
                if (FS.existsSync(path) && FS.statSync(path).isFile()) {
                    var contents = FS.readFileSync(path, 'utf-8');
                    if (path.substr(-4).toLocaleLowerCase() === '.hbs') {
                        var template = Handlebars.compile(contents);
                        return template(context);
                    }
                    else {
                        return contents;
                    }
                }
                else {
                    return '';
                }
            });
        }
        if (this.mediaDirectory) {
            text = text.replace(this.mediaPattern, function (match, path) {
                if (FS.existsSync(Path.join(_this.mediaDirectory, path))) {
                    return _this.getRelativeUrl('media') + '/' + path;
                }
                else {
                    return match;
                }
            });
        }
        var event = new events_1.MarkdownEvent(events_1.MarkdownEvent.PARSE);
        event.originalText = text;
        event.parsedText = text;
        this.owner.trigger(event);
        return event.parsedText;
    };
    MarkedPlugin.prototype.onBeginRenderer = function (event) {
        _super.prototype.onBeginRenderer.call(this, event);
        delete this.includes;
        if (this.includeSource) {
            var includes = Path.resolve(this.includeSource);
            if (FS.existsSync(includes) && FS.statSync(includes).isDirectory()) {
                this.includes = includes;
            }
            else {
                this.application.logger.warn('Could not find provided includes directory: ' + includes);
            }
        }
        if (this.mediaSource) {
            var media = Path.resolve(this.mediaSource);
            if (FS.existsSync(media) && FS.statSync(media).isDirectory()) {
                this.mediaDirectory = Path.join(event.outputDirectory, 'media');
                FS.copySync(media, this.mediaDirectory);
            }
            else {
                this.mediaDirectory = null;
                this.application.logger.warn('Could not find provided media directory: ' + media);
            }
        }
    };
    MarkedPlugin.prototype.onParseMarkdown = function (event) {
        event.parsedText = Marked(event.parsedText);
    };
    __decorate([
        component_1.Option({
            name: 'includes',
            help: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
            hint: declaration_1.ParameterHint.Directory
        })
    ], MarkedPlugin.prototype, "includeSource", void 0);
    __decorate([
        component_1.Option({
            name: 'media',
            help: 'Specifies the location with media files that should be copied to the output directory.',
            hint: declaration_1.ParameterHint.Directory
        })
    ], MarkedPlugin.prototype, "mediaSource", void 0);
    MarkedPlugin = __decorate([
        components_1.Component({ name: 'marked' })
    ], MarkedPlugin);
    return MarkedPlugin;
}(components_1.ContextAwareRendererComponent));
exports.MarkedPlugin = MarkedPlugin;
//# sourceMappingURL=MarkedPlugin.js.map