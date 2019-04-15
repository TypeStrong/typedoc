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
let VariableStatementConverter = class VariableStatementConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.VariableStatement
        ];
    }
    convert(context, node) {
        if (node.declarationList && node.declarationList.declarations) {
            node.declarationList.declarations.forEach((variableDeclaration) => {
                if (ts.isArrayBindingPattern(variableDeclaration.name) || ts.isObjectBindingPattern(variableDeclaration.name)) {
                    this.convertBindingPattern(context, variableDeclaration.name);
                }
                else {
                    this.owner.convertNode(context, variableDeclaration);
                }
            });
        }
        return context.scope;
    }
    convertBindingPattern(context, node) {
        node.elements.forEach((element) => {
            this.owner.convertNode(context, element);
            if (!ts.isBindingElement(element)) {
                return;
            }
            if (ts.isArrayBindingPattern(element.name) || ts.isObjectBindingPattern(element.name)) {
                this.convertBindingPattern(context, element.name);
            }
        });
    }
};
VariableStatementConverter = __decorate([
    components_1.Component({ name: 'node:variable-statement' })
], VariableStatementConverter);
exports.VariableStatementConverter = VariableStatementConverter;
//# sourceMappingURL=variable-statement.js.map