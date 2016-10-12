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
var index_1 = require("../../models/types/index");
var components_1 = require("../components");
var StringLiteralConverter = (function (_super) {
    __extends(StringLiteralConverter, _super);
    function StringLiteralConverter() {
        _super.apply(this, arguments);
    }
    StringLiteralConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 9;
    };
    StringLiteralConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 32);
    };
    StringLiteralConverter.prototype.convertNode = function (context, node) {
        return new index_1.StringLiteralType(node.text);
    };
    StringLiteralConverter.prototype.convertType = function (context, type) {
        return new index_1.StringLiteralType(type.text);
    };
    StringLiteralConverter = __decorate([
        components_1.Component({ name: 'type:string-literal' })
    ], StringLiteralConverter);
    return StringLiteralConverter;
}(components_1.ConverterTypeComponent));
exports.StringLiteralConverter = StringLiteralConverter;
//# sourceMappingURL=string-literal.js.map