"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const components_1 = require("../components");
let TypeLiteralConverter = class TypeLiteralConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.TypeLiteral
        ];
    }
    convert(context, node) {
        if (node.members) {
            node.members.forEach((node) => {
                this.owner.convertNode(context, node);
            });
        }
        return context.scope;
    }
};
TypeLiteralConverter = __decorate([
    components_1.Component({ name: 'node:literal-type' })
], TypeLiteralConverter);
exports.TypeLiteralConverter = TypeLiteralConverter;
//# sourceMappingURL=literal-type.js.map