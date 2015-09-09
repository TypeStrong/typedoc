var Converter_1 = require("../../Converter");
var TypeParameterReflection_1 = require("../../../models/reflections/TypeParameterReflection");
var TypeParameterType_1 = require("../../../models/types/TypeParameterType");
var type_1 = require("../type");
function createTypeParameter(context, node) {
    var typeParameter = new TypeParameterType_1.TypeParameterType();
    typeParameter.name = node.symbol.name;
    if (node.constraint) {
        typeParameter.constraint = type_1.convertType(context, node.constraint);
    }
    var reflection = context.scope;
    var typeParameterReflection = new TypeParameterReflection_1.TypeParameterReflection(reflection, typeParameter);
    if (!reflection.typeParameters)
        reflection.typeParameters = [];
    reflection.typeParameters.push(typeParameterReflection);
    context.registerReflection(typeParameterReflection, node);
    context.trigger(Converter_1.Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);
    return typeParameter;
}
exports.createTypeParameter = createTypeParameter;
