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
let ClassConverter = class ClassConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.ClassExpression,
            ts.SyntaxKind.ClassDeclaration
        ];
    }
    convert(context, node) {
        let reflection;
        if (context.isInherit && context.inheritParent === node) {
            reflection = context.scope;
        }
        else {
            reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Class);
            if (reflection && node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.AbstractKeyword)) {
                reflection.setFlag(index_1.ReflectionFlag.Abstract, true);
            }
        }
        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    const modifiers = ts.getCombinedModifierFlags(member);
                    const privateMember = (modifiers & ts.ModifierFlags.Private) > 0;
                    const protectedMember = (modifiers & ts.ModifierFlags.Protected) > 0;
                    const exclude = (context.converter.excludePrivate && privateMember)
                        || (context.converter.excludeProtected && protectedMember);
                    if (!exclude) {
                        this.owner.convertNode(context, member);
                    }
                });
            }
            const extendsClause = lodash_1.toArray(node.heritageClauses).find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
            if (extendsClause) {
                const baseType = extendsClause.types[0];
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
            }
            const implementsClause = lodash_1.toArray(node.heritageClauses).find(h => h.token === ts.SyntaxKind.ImplementsKeyword);
            if (implementsClause) {
                const implemented = this.owner.convertTypes(context, implementsClause.types);
                reflection.implementedTypes = (reflection.implementedTypes || []).concat(implemented);
            }
        });
        return reflection;
    }
};
ClassConverter = __decorate([
    components_1.Component({ name: 'node:class' })
], ClassConverter);
exports.ClassConverter = ClassConverter;
//# sourceMappingURL=class.js.map