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
const index_2 = require("../factories/index");
const converter_1 = require("../converter");
const components_1 = require("../components");
let FunctionConverter = class FunctionConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.MethodSignature,
            ts.SyntaxKind.MethodDeclaration,
            ts.SyntaxKind.FunctionDeclaration
        ];
    }
    convert(context, node) {
        const scope = context.scope;
        const kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Method : index_1.ReflectionKind.Function;
        const hasBody = !!node.body;
        const method = index_2.createDeclaration(context, node, kind);
        if (method
            && kind & index_1.ReflectionKind.Method
            && node.modifiers
            && node.modifiers.some(m => m.kind === ts.SyntaxKind.AbstractKeyword)) {
            method.setFlag(index_1.ReflectionFlag.Abstract, true);
        }
        context.withScope(method, () => {
            if (!hasBody || !method.signatures) {
                const signature = index_2.createSignature(context, node, method.name, index_1.ReflectionKind.CallSignature);
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
    }
};
FunctionConverter = __decorate([
    components_1.Component({ name: 'node:function' })
], FunctionConverter);
exports.FunctionConverter = FunctionConverter;
//# sourceMappingURL=function.js.map