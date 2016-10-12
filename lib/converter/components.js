"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("../utils/component");
exports.Component = component_1.Component;
var ConverterComponent = (function (_super) {
    __extends(ConverterComponent, _super);
    function ConverterComponent() {
        _super.apply(this, arguments);
    }
    return ConverterComponent;
}(component_1.AbstractComponent));
exports.ConverterComponent = ConverterComponent;
var ConverterNodeComponent = (function (_super) {
    __extends(ConverterNodeComponent, _super);
    function ConverterNodeComponent() {
        _super.apply(this, arguments);
    }
    return ConverterNodeComponent;
}(ConverterComponent));
exports.ConverterNodeComponent = ConverterNodeComponent;
var ConverterTypeComponent = (function (_super) {
    __extends(ConverterTypeComponent, _super);
    function ConverterTypeComponent() {
        _super.apply(this, arguments);
        this.priority = 0;
    }
    return ConverterTypeComponent;
}(ConverterComponent));
exports.ConverterTypeComponent = ConverterTypeComponent;
//# sourceMappingURL=components.js.map