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
var converter_1 = require("../converter");
var components_1 = require("../components");
var FunctionConverter = (function (_super) {
    __extends(FunctionConverter, _super);
    function FunctionConverter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.supports = [
            ts.SyntaxKind.MethodSignature,
            ts.SyntaxKind.MethodDeclaration,
            ts.SyntaxKind.FunctionDeclaration
        ];
        return _this;
    }
    FunctionConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        var kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Method : index_1.ReflectionKind.Function;
        var hasBody = !!node.body;
        var method = index_2.createDeclaration(context, node, kind);
        if (method
            && kind & index_1.ReflectionKind.Method
            && node.modifiers
            && node.modifiers.some(function (m) { return m.kind === ts.SyntaxKind.AbstractKeyword; })) {
            method.setFlag(index_1.ReflectionFlag.Abstract, true);
        }
        context.withScope(method, function () {
            if (!hasBody || !method.signatures) {
                var signature = index_2.createSignature(context, node, method.name, index_1.ReflectionKind.CallSignature);
                if (!method.signatures) {
                    method.signatures = [];
                }
                method.signatures.push(signature);
            }
            else {
                context.trigger(converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    };
    FunctionConverter = __decorate([
        components_1.Component({ name: 'node:function' })
    ], FunctionConverter);
    return FunctionConverter;
}(components_1.ConverterNodeComponent));
exports.FunctionConverter = FunctionConverter;
//# sourceMappingURL=function.js.map