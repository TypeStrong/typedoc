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
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var events_1 = require("../utils/events");
var RendererEvent = (function (_super) {
    __extends(RendererEvent, _super);
    function RendererEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RendererEvent.prototype.createPageEvent = function (mapping) {
        var event = new PageEvent(PageEvent.BEGIN);
        event.project = this.project;
        event.settings = this.settings;
        event.url = mapping.url;
        event.model = mapping.model;
        event.templateName = mapping.template;
        event.filename = Path.join(this.outputDirectory, mapping.url);
        return event;
    };
    RendererEvent.BEGIN = 'beginRender';
    RendererEvent.END = 'endRender';
    return RendererEvent;
}(events_1.Event));
exports.RendererEvent = RendererEvent;
var PageEvent = (function (_super) {
    __extends(PageEvent, _super);
    function PageEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PageEvent.BEGIN = 'beginPage';
    PageEvent.END = 'endPage';
    return PageEvent;
}(events_1.Event));
exports.PageEvent = PageEvent;
var MarkdownEvent = (function (_super) {
    __extends(MarkdownEvent, _super);
    function MarkdownEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MarkdownEvent.PARSE = 'parseMarkdown';
    return MarkdownEvent;
}(events_1.Event));
exports.MarkdownEvent = MarkdownEvent;
//# sourceMappingURL=events.js.map