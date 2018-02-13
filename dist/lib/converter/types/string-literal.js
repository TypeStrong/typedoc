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
var StringLiteralConverter = (function (_super) {
    __extends(StringLiteralConverter, _super);
    function StringLiteralConverter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringLiteralConverter.prototype.supportsNode = function (context, node) {
        return node.kind === ts.SyntaxKind.StringLiteral;
    };
    StringLiteralConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & ts.TypeFlags.StringLiteral);
    };
    StringLiteralConverter.prototype.convertNode = function (context, node) {
        return new index_1.StringLiteralType(node.text);
    };
    StringLiteralConverter.prototype.convertType = function (context, type) {
        return new index_1.StringLiteralType(type.value);
    };
    StringLiteralConverter = __decorate([
        components_1.Component({ name: 'type:string-literal' })
    ], StringLiteralConverter);
    return StringLiteralConverter;
}(components_1.ConverterTypeComponent));
exports.StringLiteralConverter = StringLiteralConverter;
//# sourceMappingURL=string-literal.js.map