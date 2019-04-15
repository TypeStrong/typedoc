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
const components_1 = require("../components");
let IndexSignatureConverter = class IndexSignatureConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.IndexSignature
        ];
    }
    convert(context, node) {
        const scope = context.scope;
        if (scope instanceof index_1.DeclarationReflection) {
            scope.indexSignature = index_2.createSignature(context, node, '__index', index_1.ReflectionKind.IndexSignature);
        }
        return scope;
    }
};
IndexSignatureConverter = __decorate([
    components_1.Component({ name: 'node:signature-index' })
], IndexSignatureConverter);
exports.IndexSignatureConverter = IndexSignatureConverter;
//# sourceMappingURL=signature-index.js.map