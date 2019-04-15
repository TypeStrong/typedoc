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
let AliasConverter = class AliasConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.TypeAliasDeclaration
        ];
    }
    convert(context, node) {
        const alias = index_2.createDeclaration(context, node, index_1.ReflectionKind.TypeAlias);
        context.withScope(alias, node.typeParameters, () => {
            alias.type = this.owner.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });
        return alias;
    }
};
AliasConverter = __decorate([
    components_1.Component({ name: 'node:alias' })
], AliasConverter);
exports.AliasConverter = AliasConverter;
//# sourceMappingURL=alias.js.map