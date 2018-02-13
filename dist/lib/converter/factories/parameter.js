"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ts = require("../../ts-internal");
var index_1 = require("../../models/reflections/index");
var converter_1 = require("../converter");
var convert_expression_1 = require("../convert-expression");
function createParameter(context, node) {
    var signature = context.scope;
    if (!(signature instanceof index_1.SignatureReflection)) {
        throw new Error('Expected signature reflection.');
    }
    var parameter = new index_1.ParameterReflection(signature, node.symbol.name, index_1.ReflectionKind.Parameter);
    context.registerReflection(parameter, node);
    context.withScope(parameter, function () {
        if (_ts.isBindingPattern(node.name)) {
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