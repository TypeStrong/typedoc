"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var MarkedLinksPlugin_1;
const Util = require("util");
const components_1 = require("../components");
const events_1 = require("../events");
const component_1 = require("../../utils/component");
const declaration_1 = require("../../utils/options/declaration");
let MarkedLinksPlugin = MarkedLinksPlugin_1 = class MarkedLinksPlugin extends components_1.ContextAwareRendererComponent {
    constructor() {
        super(...arguments);
        this.brackets = /\[\[([^\]]+)\]\]/g;
        this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
        this.warnings = [];
    }
    initialize() {
        super.initialize();
        this.listenTo(this.owner, {
            [events_1.MarkdownEvent.PARSE]: this.onParseMarkdown,
            [events_1.RendererEvent.END]: this.onEndRenderer
        }, undefined, 100);
    }
    replaceBrackets(text) {
        return text.replace(this.brackets, (match, content) => {
            const split = MarkedLinksPlugin_1.splitLinkText(content);
            return this.buildLink(match, split.target, split.caption);
        });
    }
    replaceInlineTags(text) {
        return text.replace(this.inlineTag, (match, leading, tagName, content) => {
            const split = MarkedLinksPlugin_1.splitLinkText(content);
            const target = split.target;
            const caption = leading || split.caption;
            const monospace = tagName === 'linkcode';
            return this.buildLink(match, target, caption, monospace);
        });
    }
    buildLink(original, target, caption, monospace) {
        let attributes = '';
        if (this.urlPrefix.test(target)) {
            attributes = ' class="external"';
        }
        else {
            let reflection;
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
                const fullName = (this.reflection || this.project).getFullName();
                this.warnings.push(`In ${fullName}: ${original}`);
                return original;
            }
        }
        if (monospace) {
            caption = '<code>' + caption + '</code>';
        }
        return Util.format('<a href="%s"%s>%s</a>', target, attributes, caption);
    }
    onParseMarkdown(event) {
        event.parsedText = this.replaceInlineTags(this.replaceBrackets(event.parsedText));
    }
    onEndRenderer(event) {
        if (this.listInvalidSymbolLinks && this.warnings.length > 0) {
            this.application.logger.write('');
            this.application.logger.warn('[MarkedLinksPlugin]: Found invalid symbol reference(s) in JSDocs, ' +
                'they will not render as links in the generated documentation.');
            for (let warning of this.warnings) {
                this.application.logger.write('  ' + warning);
            }
        }
    }
    static splitLinkText(text) {
        let splitIndex = text.indexOf('|');
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
exports.MarkedLinksPlugin = MarkedLinksPlugin;
//# sourceMappingURL=MarkedLinksPlugin.js.map