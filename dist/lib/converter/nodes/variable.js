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
let VariableConverter = class VariableConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.PropertySignature,
            ts.SyntaxKind.PropertyDeclaration,
            ts.SyntaxKind.PropertyAssignment,
            ts.SyntaxKind.ShorthandPropertyAssignment,
            ts.SyntaxKind.VariableDeclaration,
            ts.SyntaxKind.BindingElement
        ];
    }
    isSimpleObjectLiteral(objectLiteral) {
        if (!objectLiteral.properties) {
            return true;
        }
        return objectLiteral.properties.length === 0;
    }
    convert(context, node) {
        const comment = index_2.createComment(node);
        if (comment && comment.hasTag('resolve')) {
            const resolveType = context.getTypeAtLocation(node);
            if (resolveType && resolveType.symbol) {
                const resolved = this.owner.convertNode(context, resolveType.symbol.declarations[0]);
                if (resolved && node.symbol) {
                    resolved.name = node.symbol.name;
                }
                return resolved;
            }
        }
        let name;
        let isBindingPattern;
        if (ts.isArrayBindingPattern(node.name) || ts.isObjectBindingPattern(node.name)) {
            if (ts.isBindingElement(node) && node.propertyName) {
                name = node.propertyName.getText();
                isBindingPattern = true;
            }
            else {
                return;
            }
        }
        const scope = context.scope;
        const kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Property : index_1.ReflectionKind.Variable;
        const variable = index_2.createDeclaration(context, node, kind, name);
        if (variable) {
            switch (kind) {
                case index_1.ReflectionKind.Variable:
                    if (node.parent.flags & ts.NodeFlags.Const) {
                        variable.setFlag(index_1.ReflectionFlag.Const, true);
                    }
                    else if (node.parent.flags & ts.NodeFlags.Let) {
                        variable.setFlag(index_1.ReflectionFlag.Let, true);
                    }
                    break;
                case index_1.ReflectionKind.Property:
                    if (node.modifiers
                        && node.modifiers.some(m => m.kind === ts.SyntaxKind.AbstractKeyword)) {
                        variable.setFlag(index_1.ReflectionFlag.Abstract, true);
                    }
                    break;
            }
        }
        context.withScope(variable, () => {
            if (node.initializer) {
                switch (node.initializer.kind) {
                    case ts.SyntaxKind.ArrowFunction:
                    case ts.SyntaxKind.FunctionExpression:
                        variable.kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Method : index_1.ReflectionKind.Function;
                        this.owner.convertNode(context, node.initializer);
                        break;
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        if (!this.isSimpleObjectLiteral(node.initializer)) {
                            variable.kind = index_1.ReflectionKind.ObjectLiteral;
                            variable.type = new index_1.IntrinsicType('object');
                            this.owner.convertNode(context, node.initializer);
                        }
                        break;
                    default:
                        variable.defaultValue = index_3.convertDefaultValue(node);
                }
            }
            if (variable.kind === kind || variable.kind === index_1.ReflectionKind.Event) {
                if (isBindingPattern) {
                    variable.type = this.owner.convertType(context, node.name);
                }
                else {
                    variable.type = this.owner.convertType(context, node.type, context.getTypeAtLocation(node));
                }
            }
        });
        return variable;
    }
};
VariableConverter = __decorate([
    components_1.Component({ name: 'node:variable' })
], VariableConverter);
exports.VariableConverter = VariableConverter;
//# sourceMappingURL=variable.js.map