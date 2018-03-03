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
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var components_1 = require("../components");
var index_3 = require("../index");
var EnumConverter = (function (_super) {
    __extends(EnumConverter, _super);
    function EnumConverter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.supports = [
            ts.SyntaxKind.EnumDeclaration
        ];
        return _this;
    }
    EnumConverter.prototype.convert = function (context, node) {
        var _this = this;
        var enumeration = index_2.createDeclaration(context, node, index_1.ReflectionKind.Enum);
        context.withScope(enumeration, function () {
            if (node.members) {
                for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                    var member = _a[_i];
                    _this.convertMember(context, member);
                }
            }
        });
        return enumeration;
    };
    EnumConverter.prototype.convertMember = function (context, node) {
        var member = index_2.createDeclaration(context, node, index_1.ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = index_3.convertDefaultValue(node);
        }
        return member;
    };
    EnumConverter = __decorate([
        components_1.Component({ name: 'node:enum' })
    ], EnumConverter);
    return EnumConverter;
}(components_1.ConverterNodeComponent));
exports.EnumConverter = EnumConverter;
//# sourceMappingURL=enum.js.map