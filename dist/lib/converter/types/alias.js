"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/index");
const components_1 = require("../components");
let AliasConverter = class AliasConverter extends components_1.ConverterTypeComponent {
    constructor() {
        super(...arguments);
        this.priority = 100;
    }
    supportsNode(context, node, type) {
        if (!type || !node || !node.typeName) {
            return false;
        }
        if (!type.symbol) {
            return true;
        }
        const checker = context.checker;
        let symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
        if (!symbolName.length) {
            return false;
        }
        if (symbolName[0].substr(0, 1) === '"') {
            symbolName.shift();
        }
        let nodeName = node.typeName.getText().split('.');
        if (!nodeName.length) {
            return false;
        }
        let common = Math.min(symbolName.length, nodeName.length);
        symbolName = symbolName.slice(-common);
        nodeName = nodeName.slice(-common);
        return nodeName.join('.') !== symbolName.join('.');
    }
    convertNode(context, node) {
        const name = node.typeName.getText();
        const result = new index_1.ReferenceType(name, index_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
        if (node.typeArguments) {
            result.typeArguments = this.owner.convertTypes(context, node.typeArguments);
        }
        return result;
    }
};
AliasConverter = __decorate([
    components_1.Component({ name: 'type:alias' })
], AliasConverter);
exports.AliasConverter = AliasConverter;
//# sourceMappingURL=alias.js.map