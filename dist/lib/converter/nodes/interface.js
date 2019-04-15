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
const lodash_1 = require("lodash");
let InterfaceConverter = class InterfaceConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.InterfaceDeclaration
        ];
    }
    convert(context, node) {
        let reflection;
        if (context.isInherit && context.inheritParent === node) {
            reflection = context.scope;
        }
        else {
            reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Interface);
        }
        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    this.owner.convertNode(context, member);
                });
            }
            const extendsClause = lodash_1.toArray(node.heritageClauses).find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
            if (extendsClause) {
                extendsClause.types.forEach((baseType) => {
                    const type = context.getTypeAtLocation(baseType);
                    if (!context.isInherit) {
                        if (!reflection.extendedTypes) {
                            reflection.extendedTypes = [];
                        }
                        const convertedType = this.owner.convertType(context, baseType, type);
                        if (convertedType) {
                            reflection.extendedTypes.push(convertedType);
                        }
                    }
                    if (type) {
                        const typesToInheritFrom = type.isIntersection() ? type.types : [type];
                        typesToInheritFrom.forEach((typeToInheritFrom) => {
                            typeToInheritFrom.symbol && typeToInheritFrom.symbol.declarations.forEach((declaration) => {
                                context.inherit(declaration, baseType.typeArguments);
                            });
                        });
                    }
                });
            }
        });
        return reflection;
    }
};
InterfaceConverter = __decorate([
    components_1.Component({ name: 'node:interface' })
], InterfaceConverter);
exports.InterfaceConverter = InterfaceConverter;
//# sourceMappingURL=interface.js.map