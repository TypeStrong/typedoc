"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/index");
const components_1 = require("../components");
const index_2 = require("../factories/index");
let SignatureConverter = class SignatureConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.CallSignature,
            ts.SyntaxKind.FunctionType,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.ArrowFunction
        ];
    }
    convert(context, node) {
        const scope = context.scope;
        if (scope instanceof index_1.DeclarationReflection) {
            const name = scope.kindOf(index_1.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            const signature = index_2.createSignature(context, node, name, index_1.ReflectionKind.CallSignature);
            if (!scope.signatures) {
                scope.signatures = [];
            }
            scope.signatures.push(signature);
        }
        return scope;
    }
};
SignatureConverter = __decorate([
    components_1.Component({ name: 'node:signature-call' })
], SignatureConverter);
exports.SignatureConverter = SignatureConverter;
//# sourceMappingURL=signature-call.js.map