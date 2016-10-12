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
var index_1 = require("../../models/index");
var components_1 = require("../components");
var AliasConverter = (function (_super) {
    __extends(AliasConverter, _super);
    function AliasConverter() {
        _super.apply(this, arguments);
        this.priority = 100;
    }
    AliasConverter.prototype.supportsNode = function (context, node, type) {
        if (!type || !node || !node.typeName)
            return false;
        if (!type.symbol)
            return true;
        var checker = context.checker;
        var symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
        if (!symbolName.length)
            return false;
        if (symbolName[0].substr(0, 1) == '"')
            symbolName.shift();
        var nodeName = ts.getTextOfNode(node.typeName).split('.');
        if (!nodeName.length)
            return false;
        var common = Math.min(symbolName.length, nodeName.length);
        symbolName = symbolName.slice(-common);
        nodeName = nodeName.slice(-common);
        return nodeName.join('.') != symbolName.join('.');
    };
    AliasConverter.prototype.convertNode = function (context, node) {
        var name = ts.getTextOfNode(node.typeName);
        return new index_1.ReferenceType(name, index_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
    };
    AliasConverter = __decorate([
        components_1.Component({ name: 'type:alias' })
    ], AliasConverter);
    return AliasConverter;
}(components_1.ConverterTypeComponent));
exports.AliasConverter = AliasConverter;
//# sourceMappingURL=alias.js.map