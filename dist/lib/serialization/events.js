"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../utils/events");
class SerializeEvent extends events_1.Event {
    constructor(name, project) {
        super(name);
        this.project = project;
    }
}
exports.SerializeEvent = SerializeEvent;
//# sourceMappingURL=events.js.map