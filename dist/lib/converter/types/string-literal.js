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
let StringLiteralConverter = class StringLiteralConverter extends components_1.ConverterTypeComponent {
    supportsNode(context, node) {
        return node.kind === ts.SyntaxKind.StringLiteral;
    }
    supportsType(context, type) {
        return !!(type.flags & ts.TypeFlags.StringLiteral);
    }
    convertNode(context, node) {
        return new index_1.StringLiteralType(node.text);
    }
    convertType(context, type) {
        return new index_1.StringLiteralType(type.value);
    }
};
StringLiteralConverter = __decorate([
    components_1.Component({ name: 'type:string-literal' })
], StringLiteralConverter);
exports.StringLiteralConverter = StringLiteralConverter;
//# sourceMappingURL=string-literal.js.map