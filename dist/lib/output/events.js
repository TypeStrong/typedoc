"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const events_1 = require("../utils/events");
class RendererEvent extends events_1.Event {
    constructor(name, outputDirectory, project) {
        super(name);
        this.outputDirectory = outputDirectory;
        this.project = project;
    }
    createPageEvent(mapping) {
        const event = new PageEvent(PageEvent.BEGIN);
        event.project = this.project;
        event.settings = this.settings;
        event.url = mapping.url;
        event.model = mapping.model;
        event.templateName = mapping.template;
        event.filename = Path.join(this.outputDirectory, mapping.url);
        return event;
    }
}
RendererEvent.BEGIN = 'beginRender';
RendererEvent.END = 'endRender';
exports.RendererEvent = RendererEvent;
class PageEvent extends events_1.Event {
}
PageEvent.BEGIN = 'beginPage';
PageEvent.END = 'endPage';
exports.PageEvent = PageEvent;
class MarkdownEvent extends events_1.Event {
    constructor(name, originalText, parsedText) {
        super(name);
        this.originalText = originalText;
        this.parsedText = parsedText;
    }
}
MarkdownEvent.PARSE = 'parseMarkdown';
exports.MarkdownEvent = MarkdownEvent;
//# sourceMappingURL=events.js.map