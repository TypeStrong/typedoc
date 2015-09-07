var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("../../EventDispatcher");
var OutputPageEvent = (function (_super) {
    __extends(OutputPageEvent, _super);
    function OutputPageEvent() {
        _super.apply(this, arguments);
    }
    return OutputPageEvent;
})(EventDispatcher_1.Event);
exports.OutputPageEvent = OutputPageEvent;
