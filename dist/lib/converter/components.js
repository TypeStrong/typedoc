"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../utils/component");
exports.Component = component_1.Component;
class ConverterComponent extends component_1.AbstractComponent {
}
exports.ConverterComponent = ConverterComponent;
class ConverterNodeComponent extends ConverterComponent {
}
exports.ConverterNodeComponent = ConverterNodeComponent;
class ConverterTypeComponent extends ConverterComponent {
    constructor() {
        super(...arguments);
        this.priority = 0;
    }
}
exports.ConverterTypeComponent = ConverterTypeComponent;
//# sourceMappingURL=components.js.map