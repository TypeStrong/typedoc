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
let ArrayConverter = class ArrayConverter extends components_1.ConverterTypeComponent {
    supportsNode(context, node) {
        return node.kind === ts.SyntaxKind.ArrayType;
    }
    supportsType(context, type) {
        return !!(type.flags & ts.TypeFlags.Object)
            && !!type.symbol
            && type.symbol.name === 'Array'
            && !type.symbol.parent
            && !!type.typeArguments
            && type.typeArguments.length === 1;
    }
    convertNode(context, node) {
        const result = this.owner.convertType(context, node.elementType);
        if (result) {
            return new index_1.ArrayType(result);
        }
    }
    convertType(context, type) {
        const result = this.owner.convertType(context, undefined, type.typeArguments && type.typeArguments[0]);
        if (result) {
            return new index_1.ArrayType(result);
        }
    }
};
ArrayConverter = __decorate([
    components_1.Component({ name: 'type:array' })
], ArrayConverter);
exports.ArrayConverter = ArrayConverter;
//# sourceMappingURL=array.js.map