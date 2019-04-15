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
const index_2 = require("../../models/reflections/index");
const index_3 = require("../factories/index");
const components_1 = require("../components");
const converter_1 = require("../converter");
let ReferenceConverter = class ReferenceConverter extends components_1.ConverterTypeComponent {
    constructor() {
        super(...arguments);
        this.priority = -50;
    }
    supportsNode(context, node, type) {
        return !!(type.flags & ts.TypeFlags.Object);
    }
    supportsType(context, type) {
        return !!(type.flags & ts.TypeFlags.Object);
    }
    convertNode(context, node, type) {
        if (!type.symbol) {
            return new index_1.IntrinsicType('Object');
        }
        else if (type.symbol.declarations && (type.symbol.flags & ts.SymbolFlags.TypeLiteral || type.symbol.flags & ts.SymbolFlags.ObjectLiteral)) {
            return this.convertLiteral(context, type.symbol, node);
        }
        const result = index_3.createReferenceType(context, type.symbol);
        if (result && node.typeArguments) {
            result.typeArguments = this.owner.convertTypes(context, node.typeArguments);
        }
        return result;
    }
    convertType(context, type) {
        if (!type.symbol) {
            return new index_1.IntrinsicType('Object');
        }
        else if (type.symbol.declarations && (type.symbol.flags & ts.SymbolFlags.TypeLiteral || type.symbol.flags & ts.SymbolFlags.ObjectLiteral)) {
            return this.convertLiteral(context, type.symbol);
        }
        const result = index_3.createReferenceType(context, type.symbol);
        if (result && type.typeArguments) {
            result.typeArguments = this.owner.convertTypes(context, undefined, type.typeArguments);
        }
        return result;
    }
    convertLiteral(context, symbol, node) {
        for (let declaration of symbol.declarations) {
            if (context.visitStack.includes(declaration)) {
                if (declaration.kind === ts.SyntaxKind.TypeLiteral ||
                    declaration.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                    return index_3.createReferenceType(context, declaration.parent.symbol);
                }
                else {
                    return index_3.createReferenceType(context, declaration.symbol);
                }
            }
        }
        const declaration = new index_2.DeclarationReflection('__type', index_2.ReflectionKind.TypeLiteral, context.scope);
        context.registerReflection(declaration, undefined, symbol);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, () => {
            symbol.declarations.forEach((node) => {
                this.owner.convertNode(context, node);
            });
        });
        return new index_1.ReflectionType(declaration);
    }
};
ReferenceConverter = __decorate([
    components_1.Component({ name: 'type:reference' })
], ReferenceConverter);
exports.ReferenceConverter = ReferenceConverter;
//# sourceMappingURL=reference.js.map