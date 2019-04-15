"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/reflections/index");
const converter_1 = require("../converter");
const convert_expression_1 = require("../convert-expression");
function createParameter(context, node) {
    if (!(context.scope instanceof index_1.SignatureReflection)) {
        throw new Error('Expected signature reflection.');
    }
    const signature = context.scope;
    if (!node.symbol) {
        return;
    }
    const parameter = new index_1.ParameterReflection(node.symbol.name, index_1.ReflectionKind.Parameter, signature);
    context.registerReflection(parameter, node);
    context.withScope(parameter, () => {
        if (ts.isArrayBindingPattern(node.name) || ts.isObjectBindingPattern(node.name)) {
            parameter.type = context.converter.convertType(context, node.name);
            parameter.name = '__namedParameters';
        }
        else {
            parameter.type = context.converter.convertType(context, node.type, context.getTypeAtLocation(node));
        }
        parameter.defaultValue = convert_expression_1.convertDefaultValue(node);
        parameter.setFlag(index_1.ReflectionFlag.Optional, !!node.questionToken);
        parameter.setFlag(index_1.ReflectionFlag.Rest, !!node.dotDotDotToken);
        parameter.setFlag(index_1.ReflectionFlag.DefaultValue, !!parameter.defaultValue);
        if (!signature.parameters) {
            signature.parameters = [];
        }
        signature.parameters.push(parameter);
    });
    context.trigger(converter_1.Converter.EVENT_CREATE_PARAMETER, parameter, node);
    return parameter;
}
exports.createParameter = createParameter;
//# sourceMappingURL=parameter.js.map