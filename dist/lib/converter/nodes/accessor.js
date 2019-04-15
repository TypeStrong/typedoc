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
let AccessorConverter = class AccessorConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.GetAccessor,
            ts.SyntaxKind.SetAccessor
        ];
    }
    convert(context, node) {
        const accessor = index_2.createDeclaration(context, node, index_1.ReflectionKind.Accessor);
        context.withScope(accessor, () => {
            if (node.kind === ts.SyntaxKind.GetAccessor) {
                accessor.getSignature = index_2.createSignature(context, node, '__get', index_1.ReflectionKind.GetSignature);
            }
            else {
                accessor.setSignature = index_2.createSignature(context, node, '__set', index_1.ReflectionKind.SetSignature);
            }
        });
        return accessor;
    }
};
AccessorConverter = __decorate([
    components_1.Component({ name: 'node:accessor' })
], AccessorConverter);
exports.AccessorConverter = AccessorConverter;
//# sourceMappingURL=accessor.js.map