"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ts = require("typescript");
var components_1 = require("../components");
var ObjectLiteralConverter = (function (_super) {
    __extends(ObjectLiteralConverter, _super);
    function ObjectLiteralConverter() {
        _super.apply(this, arguments);
        this.supports = [
            171
        ];
    }
    ObjectLiteralConverter.prototype.convert = function (context, node) {
        var _this = this;
        if (node.properties) {
            node.properties.forEach(function (node) {
                _this.owner.convertNode(context, node);
            });
        }
        return context.scope;
    };
    ObjectLiteralConverter = __decorate([
        components_1.Component({ name: 'node:literal-object' })
    ], ObjectLiteralConverter);
    return ObjectLiteralConverter;
}(components_1.ConverterNodeComponent));
exports.ObjectLiteralConverter = ObjectLiteralConverter;
//# sourceMappingURL=literal-object.js.map