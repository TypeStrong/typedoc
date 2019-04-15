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
const index_3 = require("../index");
let EnumConverter = class EnumConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.EnumDeclaration
        ];
    }
    convert(context, node) {
        const enumeration = index_2.createDeclaration(context, node, index_1.ReflectionKind.Enum);
        context.withScope(enumeration, () => {
            if (node.members) {
                for (let member of node.members) {
                    this.convertMember(context, member);
                }
            }
        });
        return enumeration;
    }
    convertMember(context, node) {
        const member = index_2.createDeclaration(context, node, index_1.ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = index_3.convertDefaultValue(node);
        }
        return member;
    }
};
EnumConverter = __decorate([
    components_1.Component({ name: 'node:enum' })
], EnumConverter);
exports.EnumConverter = EnumConverter;
//# sourceMappingURL=enum.js.map