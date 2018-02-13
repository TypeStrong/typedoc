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
var AliasConverter = (function (_super) {
    __extends(AliasConverter, _super);
    function AliasConverter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.supports = [
            ts.SyntaxKind.TypeAliasDeclaration
        ];
        return _this;
    }
    AliasConverter.prototype.convert = function (context, node) {
        var _this = this;
        var alias = index_2.createDeclaration(context, node, index_1.ReflectionKind.TypeAlias);
        context.withScope(alias, node.typeParameters, function () {
            alias.type = _this.owner.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });
        return alias;
    };
    AliasConverter = __decorate([
        components_1.Component({ name: 'node:alias' })
    ], AliasConverter);
    return AliasConverter;
}(components_1.ConverterNodeComponent));
exports.AliasConverter = AliasConverter;
//# sourceMappingURL=alias.js.map