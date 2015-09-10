var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FS = require("fs-extra");
var Path = require("path");
var Marked = require("marked");
var HighlightJS = require("highlight.js");
var Handlebars = require("handlebars");
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var Options_1 = require("../../Options");
var signature_1 = require("../../models/reflections/signature");
var MarkdownEvent_1 = require("../events/MarkdownEvent");
var MarkedPlugin = (function (_super) {
    __extends(MarkedPlugin, _super);
    function MarkedPlugin(renderer) {
        var _this = this;
        _super.call(this, renderer);
        this.includePattern = /\[\[include:([^\]]+?)\]\]/g;
        this.mediaPattern = /media:\/\/([^ "\)\]\}]+)/g;
        renderer.on(MarkedPlugin.EVENT_PARSE_MARKDOWN, this.onParseMarkdown, this);
        var that = this;
        Handlebars.registerHelper('markdown', function (arg) { return that.parseMarkdown(arg.fn(this), this); });
        Handlebars.registerHelper('compact', function (arg) { return that.getCompact(arg.fn(this)); });
        Handlebars.registerHelper('relativeURL', function (url) { return _this.getRelativeUrl(url); });
        Handlebars.registerHelper('wbr', function (str) { return _this.getWordBreaks(str); });
        Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) { return that.getIfCond(v1, operator, v2, options, this); });
        Handlebars.registerHelper('ifSignature', function (obj, arg) { return obj instanceof signature_1.SignatureReflection ? arg.fn(this) : arg.inverse(this); });
        Marked.setOptions({
            highlight: function (text, lang) { return _this.getHighlighted(text, lang); }
        });
    }
    MarkedPlugin.prototype.getParameters = function () {
        return [{
                name: 'includes',
                help: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
                hint: Options_1.ParameterHint.Directory
            }, {
                name: 'media',
                help: 'Specifies the location with media files that should be copied to the output directory.',
                hint: Options_1.ParameterHint.Directory
            }];
    };
    MarkedPlugin.prototype.getCompact = function (text) {
        var lines = text.split('\n');
        for (var i = 0, c = lines.length; i < c; i++) {
            lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
        }
        return lines.join('');
    };
    MarkedPlugin.prototype.getWordBreaks = function (str) {
        str = str.replace(/([^_\-][_\-])([^_\-])/g, function (m, a, b) { return a + '<wbr>' + b; });
        str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, function (m, a, b) { return a + '<wbr>' + b; });
        return str;
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
            this.renderer.application.logger.warn(error.message);
            return text;
        }
    };
    MarkedPlugin.prototype.getIfCond = function (v1, operator, v2, options, context) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(context) : options.inverse(context);
            case '===':
                return (v1 === v2) ? options.fn(context) : options.inverse(context);
            case '<':
                return (v1 < v2) ? options.fn(context) : options.inverse(context);
            case '<=':
                return (v1 <= v2) ? options.fn(context) : options.inverse(context);
            case '>':
                return (v1 > v2) ? options.fn(context) : options.inverse(context);
            case '>=':
                return (v1 >= v2) ? options.fn(context) : options.inverse(context);
            case '&&':
                return (v1 && v2) ? options.fn(context) : options.inverse(context);
            case '||':
                return (v1 || v2) ? options.fn(context) : options.inverse(context);
            default:
                return options.inverse(context);
        }
    };
    MarkedPlugin.prototype.parseMarkdown = function (text, context) {
        var _this = this;
        if (this.includes) {
            text = text.replace(this.includePattern, function (match, path) {
                path = Path.join(_this.includes, path.trim());
                if (FS.existsSync(path) && FS.statSync(path).isFile()) {
                    var contents = FS.readFileSync(path, 'utf-8');
                    if (path.substr(-4).toLocaleLowerCase() == '.hbs') {
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
        var event = new MarkdownEvent_1.MarkdownEvent();
        event.originalText = text;
        event.parsedText = text;
        this.renderer.dispatch(MarkedPlugin.EVENT_PARSE_MARKDOWN, event);
        return event.parsedText;
    };
    MarkedPlugin.prototype.onRendererBegin = function (event) {
        _super.prototype.onRendererBegin.call(this, event);
        delete this.includes;
        if (event.settings.includes) {
            var includes = Path.resolve(event.settings.includes);
            if (FS.existsSync(includes) && FS.statSync(includes).isDirectory()) {
                this.includes = includes;
            }
            else {
                this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
            }
        }
        if (event.settings.media) {
            var media = Path.resolve(event.settings.media);
            if (FS.existsSync(media) && FS.statSync(media).isDirectory()) {
                this.mediaDirectory = Path.join(event.outputDirectory, 'media');
                FS.copySync(media, this.mediaDirectory);
            }
            else {
                this.mediaDirectory = null;
                this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
            }
        }
    };
    MarkedPlugin.prototype.onParseMarkdown = function (event) {
        event.parsedText = Marked(event.parsedText);
    };
    MarkedPlugin.EVENT_PARSE_MARKDOWN = 'parseMarkdown';
    return MarkedPlugin;
})(RendererPlugin_1.ContextAwareRendererPlugin);
exports.MarkedPlugin = MarkedPlugin;
Renderer_1.Renderer.registerPlugin('marked', MarkedPlugin);
