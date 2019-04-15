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
const converter_1 = require("../converter");
let BindingObjectConverter = class BindingObjectConverter extends components_1.ConverterTypeComponent {
    supportsNode(context, node) {
        return node.kind === ts.SyntaxKind.ObjectBindingPattern;
    }
    convertNode(context, node) {
        const declaration = new index_1.DeclarationReflection('__type', index_1.ReflectionKind.TypeLiteral, context.scope);
        context.registerReflection(declaration);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, () => {
            node.elements.forEach((element) => {
                this.owner.convertNode(context, element);
            });
        });
        return new index_1.ReflectionType(declaration);
    }
};
BindingObjectConverter = __decorate([
    components_1.Component({ name: 'type:binding-object' })
], BindingObjectConverter);
exports.BindingObjectConverter = BindingObjectConverter;
//# sourceMappingURL=binding-object.js.map