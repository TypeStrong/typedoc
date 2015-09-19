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
var FS = require("fs-extra");
var Path = require("path");
var Marked = require("marked");
var HighlightJS = require("highlight.js");
var Handlebars = require("handlebars");
var components_1 = require("../components");
var signature_1 = require("../../models/reflections/signature");
var events_1 = require("../events");
var component_1 = require("../../utils/component");
var declaration_1 = require("../../utils/options/declaration");
var MarkedPlugin = (function (_super) {
    __extends(MarkedPlugin, _super);
    function MarkedPlugin() {
        _super.apply(this, arguments);
        this.includePattern = /\[\[include:([^\]]+?)\]\]/g;
        this.mediaPattern = /media:\/\/([^ "\)\]\}]+)/g;
    }
    MarkedPlugin.prototype.initialize = function () {
        var _this = this;
        _super.prototype.initialize.call(this);
        this.listenTo(this.owner, events_1.MarkdownEvent.PARSE, this.onParseMarkdown);
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
            this.application.logger.warn(error.message);
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
        }), 
        __metadata('design:type', String)
    ], MarkedPlugin.prototype, "includeSource");
    __decorate([
        component_1.Option({
            name: 'media',
            help: 'Specifies the location with media files that should be copied to the output directory.',
            hint: declaration_1.ParameterHint.Directory
        }), 
        __metadata('design:type', String)
    ], MarkedPlugin.prototype, "mediaSource");
    MarkedPlugin = __decorate([
        components_1.Component({ name: "marked" }), 
        __metadata('design:paramtypes', [])
    ], MarkedPlugin);
    return MarkedPlugin;
})(components_1.ContextAwareRendererComponent);
exports.MarkedPlugin = MarkedPlugin;
