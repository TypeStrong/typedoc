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
var index_2 = require("../factories/index");
var SignatureConverter = (function (_super) {
    __extends(SignatureConverter, _super);
    function SignatureConverter() {
        _super.apply(this, arguments);
        this.supports = [
            151,
            156,
            179,
            180
        ];
    }
    SignatureConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        if (scope instanceof index_1.DeclarationReflection) {
            var name = scope.kindOf(index_1.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            var signature = index_2.createSignature(context, node, name, index_1.ReflectionKind.CallSignature);
            if (!scope.signatures)
                scope.signatures = [];
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