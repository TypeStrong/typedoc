var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var EventDispatcher_1 = require("../../EventDispatcher");
var OutputPageEvent_1 = require("./OutputPageEvent");
var OutputEvent = (function (_super) {
    __extends(OutputEvent, _super);
    function OutputEvent() {
        _super.apply(this, arguments);
    }
    OutputEvent.prototype.createPageEvent = function (mapping) {
        var event = new OutputPageEvent_1.OutputPageEvent();
        event.project = this.project;
        event.settings = this.settings;
        event.url = mapping.url;
        event.model = mapping.model;
        event.templateName = mapping.template;
        event.filename = Path.join(this.outputDirectory, mapping.url);
        return event;
    };
    return OutputEvent;
})(EventDispatcher_1.Event);
exports.OutputEvent = OutputEvent;
