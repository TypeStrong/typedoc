var ts = require("typescript");
var Converter_1 = require("../../Converter");
var Reflection_1 = require("../../../models/Reflection");
var ParameterReflection_1 = require("../../../models/reflections/ParameterReflection");
var SignatureReflection_1 = require("../../../models/reflections/SignatureReflection");
var type_1 = require("../type");
var expression_1 = require("../expression");
function createParameter(context, node) {
    var signature = context.scope;
    if (!(signature instanceof SignatureReflection_1.SignatureReflection)) {
        throw new Error('Expected signature reflection.');
    }
    var parameter = new ParameterReflection_1.ParameterReflection(signature, node.symbol.name, Reflection_1.ReflectionKind.Parameter);
    context.registerReflection(parameter, node);
    context.withScope(parameter, function () {
        if (ts.isBindingPattern(node.name)) {
            parameter.type = type_1.convertType(context, node.name);
            parameter.name = '__namedParameters';
        }
        else {
            parameter.type = type_1.convertType(context, node.type, context.getTypeAtLocation(node));
        }
        parameter.defaultValue = expression_1.convertDefaultValue(node);
        parameter.setFlag(Reflection_1.ReflectionFlag.Optional, !!node.questionToken);
        parameter.setFlag(Reflection_1.ReflectionFlag.Rest, !!node.dotDotDotToken);
        parameter.setFlag(Reflection_1.ReflectionFlag.DefaultValue, !!parameter.defaultValue);
        if (!signature.parameters)
            signature.parameters = [];
        signature.parameters.push(parameter);
    });
    context.trigger(Converter_1.Converter.EVENT_CREATE_PARAMETER, parameter, node);
    return parameter;
}
exports.createParameter = createParameter;
