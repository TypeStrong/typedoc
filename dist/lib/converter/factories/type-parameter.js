"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/index");
const converter_1 = require("../converter");
function createTypeParameter(context, node) {
    if (!node.symbol) {
        return;
    }
    const typeParameter = new index_1.TypeParameterType(node.symbol.name);
    if (node.constraint) {
        typeParameter.constraint = context.converter.convertType(context, node.constraint);
    }
    const reflection = context.scope;
    const typeParameterReflection = new index_1.TypeParameterReflection(typeParameter, reflection);
    if (!reflection.typeParameters) {
        reflection.typeParameters = [];
    }
    reflection.typeParameters.push(typeParameterReflection);
    context.registerReflection(typeParameterReflection, node);
    context.trigger(converter_1.Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);
    return typeParameter;
}
exports.createTypeParameter = createTypeParameter;
//# sourceMappingURL=type-parameter.js.map