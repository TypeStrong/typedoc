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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var index_1 = require("../../models/types/index");
var components_1 = require("../components");
var TypeOperatorConverter = (function (_super) {
    __extends(TypeOperatorConverter, _super);
    function TypeOperatorConverter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.priority = 50;
        return _this;
    }
    TypeOperatorConverter.prototype.supportsNode = function (context, node, type) {
        return !!(node.kind === ts.SyntaxKind.TypeOperator);
    };
    TypeOperatorConverter.prototype.convertNode = function (context, node) {
        var target = this.owner.convertType(context, node.type);
        return new index_1.TypeOperatorType(target);
    };
    TypeOperatorConverter = __decorate([
        components_1.Component({ name: 'type:type-operator' })
    ], TypeOperatorConverter);
    return TypeOperatorConverter;
}(components_1.ConverterTypeComponent));
exports.TypeOperatorConverter = TypeOperatorConverter;
//# sourceMappingURL=type-operator.js.map