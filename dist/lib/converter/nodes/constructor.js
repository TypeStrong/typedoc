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
const converter_1 = require("../converter");
const components_1 = require("../components");
let ConstructorConverter = class ConstructorConverter extends components_1.ConverterNodeComponent {
    constructor() {
        super(...arguments);
        this.supports = [
            ts.SyntaxKind.Constructor,
            ts.SyntaxKind.ConstructSignature
        ];
    }
    convert(context, node) {
        const parent = context.scope;
        const hasBody = !!node.body;
        const method = index_2.createDeclaration(context, node, index_1.ReflectionKind.Constructor, 'constructor');
        if (node.parameters && node.parameters.length) {
            const comment = method ? method.comment : index_2.createComment(node);
            for (let parameter of node.parameters) {
                this.addParameterProperty(context, parameter, comment);
            }
        }
        context.withScope(method, () => {
            if (!hasBody || !method.signatures) {
                const name = 'new ' + parent.name;
                const signature = index_2.createSignature(context, node, name, index_1.ReflectionKind.ConstructorSignature);
                if (!node.type) {
                    signature.type = new index_1.ReferenceType(parent.name, index_1.ReferenceType.SYMBOL_ID_RESOLVED, parent);
                }
                method.signatures = method.signatures || [];
                method.signatures.push(signature);
            }
            else {
                context.trigger(converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    }
    addParameterProperty(context, parameter, comment) {
        const modifiers = ts.getCombinedModifierFlags(parameter);
        const visibility = modifiers & (ts.ModifierFlags.Public | ts.ModifierFlags.Protected |
            ts.ModifierFlags.Private | ts.ModifierFlags.Readonly);
        if (!visibility) {
            return;
        }
        const privateParameter = modifiers & ts.ModifierFlags.Private;
        if (privateParameter && context.converter.excludePrivate) {
            return;
        }
        const protectedParameter = modifiers & ts.ModifierFlags.Protected;
        if (protectedParameter && context.converter.excludeProtected) {
            return;
        }
        const property = index_2.createDeclaration(context, parameter, index_1.ReflectionKind.Property);
        if (!property) {
            return;
        }
        property.setFlag(index_1.ReflectionFlag.Static, false);
        property.type = this.owner.convertType(context, parameter.type, context.getTypeAtLocation(parameter));
        if (comment) {
            const tag = comment.getTag('param', property.name);
            if (tag && tag.text) {
                property.comment = new index_1.Comment(tag.text);
            }
        }
    }
};
ConstructorConverter = __decorate([
    components_1.Component({ name: 'node:constructor' })
], ConstructorConverter);
exports.ConstructorConverter = ConstructorConverter;
//# sourceMappingURL=constructor.js.map