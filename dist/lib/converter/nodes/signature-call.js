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
var components_1 = require("../components");
var index_2 = require("../factories/index");
var SignatureConverter = (function (_super) {
    __extends(SignatureConverter, _super);
    function SignatureConverter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.supports = [
            ts.SyntaxKind.CallSignature,
            ts.SyntaxKind.FunctionType,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.ArrowFunction
        ];
        return _this;
    }
    SignatureConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        if (scope instanceof index_1.DeclarationReflection) {
            var name_1 = scope.kindOf(index_1.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            var signature = index_2.createSignature(context, node, name_1, index_1.ReflectionKind.CallSignature);
            if (!scope.signatures) {
                scope.signatures = [];
            }
            scope.signatures.push(signature);
        }
        return scope;
    };
    SignatureConverter = __decorate([
        components_1.Component({ name: 'node:signature-call' })
    ], SignatureConverter);
    return SignatureConverter;
}(components_1.ConverterNodeComponent));
exports.SignatureConverter = SignatureConverter;
//# sourceMappingURL=signature-call.js.map