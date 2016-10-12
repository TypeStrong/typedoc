"use strict";
var index_1 = require("../../models/index");
var converter_1 = require("../converter");
function createTypeParameter(context, node) {
    var typeParameter = new index_1.TypeParameterType();
    typeParameter.name = node.symbol.name;
    if (node.constraint) {
        typeParameter.constraint = context.converter.convertType(context, node.constraint);
    }
    var reflection = context.scope;
    var typeParameterReflection = new index_1.TypeParameterReflection(reflection, typeParameter);
    if (!reflection.typeParameters)
        reflection.typeParameters = [];
    reflection.typeParameters.push(typeParameterReflection);
    context.registerReflection(typeParameterReflection, node);
    context.trigger(converter_1.Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);
    return typeParameter;
}
exports.createTypeParameter = createTypeParameter;
//# sourceMappingURL=type-parameter.js.map