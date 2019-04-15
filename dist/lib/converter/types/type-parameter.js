"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/types/index");
const components_1 = require("../components");
let TypeParameterConverter = class TypeParameterConverter extends components_1.ConverterTypeComponent {
    constructor() {
        super(...arguments);
        this.priority = -50;
    }
    supportsNode(context, node, type) {
        return !!(type.flags & ts.TypeFlags.TypeParameter);
    }
    convertNode(context, node) {
        if (node.typeName) {
            const name = node.getText();
            if (context.typeParameters && context.typeParameters[name]) {
                return context.typeParameters[name].clone();
            }
            return new index_1.TypeParameterType(name);
        }
    }
};
TypeParameterConverter = __decorate([
    components_1.Component({ name: 'type:type-parameter' })
], TypeParameterConverter);
exports.TypeParameterConverter = TypeParameterConverter;
//# sourceMappingURL=type-parameter.js.map