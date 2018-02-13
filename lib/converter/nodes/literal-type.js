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
var TypeLiteralConverter = (function (_super) {
    __extends(TypeLiteralConverter, _super);
    function TypeLiteralConverter() {
        _super.apply(this, arguments);
        this.supports = [
            156
        ];
    }
    TypeLiteralConverter.prototype.convert = function (context, node) {
        var _this = this;
        if (node.members) {
            node.members.forEach(function (node) {
                _this.owner.convertNode(context, node);
            });
        }
        return context.scope;
    };
    TypeLiteralConverter = __decorate([
        components_1.Component({ name: 'node:literal-type' })
    ], TypeLiteralConverter);
    return TypeLiteralConverter;
}(components_1.ConverterNodeComponent));
exports.TypeLiteralConverter = TypeLiteralConverter;
