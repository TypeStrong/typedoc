"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs-extra");
const Path = require("path");
const Marked = require("marked");
const HighlightJS = require("highlight.js");
const Handlebars = require("handlebars");
const components_1 = require("../components");
const events_1 = require("../events");
const component_1 = require("../../utils/component");
const declaration_1 = require("../../utils/options/declaration");
let MarkedPlugin = class MarkedPlugin extends components_1.ContextAwareRendererComponent {
    constructor() {
        super(...arguments);
        this.includePattern = /\[\[include:([^\]]+?)\]\]/g;
        this.mediaPattern = /media:\/\/([^ "\)\]\}]+)/g;
    }
    initialize() {
        super.initialize();
        this.listenTo(this.owner, events_1.MarkdownEvent.PARSE, this.onParseMarkdown);
        const that = this;
        Handlebars.registerHelper('markdown', function (arg) { return that.parseMarkdown(arg.fn(this), this); });
        Handlebars.registerHelper('relativeURL', (url) => url ? this.getRelativeUrl(url) : url);
        Marked.setOptions({
            highlight: (text, lang) => this.getHighlighted(text, lang)
        });
    }
    getHighlighted(text, lang) {
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
    }
    parseMarkdown(text, context) {
        if (this.includes) {
            text = text.replace(this.includePattern, (match, path) => {
                path = Path.join(this.includes, path.trim());
                if (FS.existsSync(path) && FS.statSync(path).isFile()) {
                    const contents = FS.readFileSync(path, 'utf-8');
                    if (path.substr(-4).toLocaleLowerCase() === '.hbs') {
                        const template = Handlebars.compile(contents);
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
            text = text.replace(this.mediaPattern, (match, path) => {
                if (FS.existsSync(Path.join(this.mediaDirectory, path))) {
                    return this.getRelativeUrl('media') + '/' + path;
                }
                else {
                    return match;
                }
            });
        }
        const event = new events_1.MarkdownEvent(events_1.MarkdownEvent.PARSE, text, text);
        this.owner.trigger(event);
        return event.parsedText;
    }
    onBeginRenderer(event) {
        super.onBeginRenderer(event);
        delete this.includes;
        if (this.includeSource) {
            const includes = Path.resolve(this.includeSource);
            if (FS.existsSync(includes) && FS.statSync(includes).isDirectory()) {
                this.includes = includes;
            }
            else {
                this.application.logger.warn('Could not find provided includes directory: ' + includes);
            }
        }
        if (this.mediaSource) {
            const media = Path.resolve(this.mediaSource);
            if (FS.existsSync(media) && FS.statSync(media).isDirectory()) {
                this.mediaDirectory = Path.join(event.outputDirectory, 'media');
                FS.copySync(media, this.mediaDirectory);
            }
            else {
                this.mediaDirectory = undefined;
                this.application.logger.warn('Could not find provided media directory: ' + media);
            }
        }
    }
    onParseMarkdown(event) {
        event.parsedText = Marked(event.parsedText);
    }
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
exports.MarkedPlugin = MarkedPlugin;
//# sourceMappingURL=MarkedPlugin.js.map