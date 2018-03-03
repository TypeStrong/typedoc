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
var component_1 = require("../utils/component");
exports.Component = component_1.Component;
var ConverterComponent = (function (_super) {
    __extends(ConverterComponent, _super);
    function ConverterComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConverterComponent;
}(component_1.AbstractComponent));
exports.ConverterComponent = ConverterComponent;
var ConverterNodeComponent = (function (_super) {
    __extends(ConverterNodeComponent, _super);
    function ConverterNodeComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConverterNodeComponent;
}(ConverterComponent));
exports.ConverterNodeComponent = ConverterNodeComponent;
var ConverterTypeComponent = (function (_super) {
    __extends(ConverterTypeComponent, _super);
    function ConverterTypeComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.priority = 0;
        return _this;
    }
    return ConverterTypeComponent;
}(ConverterComponent));
exports.ConverterTypeComponent = ConverterTypeComponent;
//# sourceMappingURL=components.js.map