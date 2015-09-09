var ts = require("typescript");
var Converter_1 = require("../../Converter");
var Reflection_1 = require("../../../models/Reflection");
var declaration_1 = require("../factories/declaration");
var signature_1 = require("../factories/signature");
var FunctionConverter = (function () {
    function FunctionConverter() {
        this.supports = [
            140,
            141,
            211,
            171,
            172
        ];
    }
    FunctionConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        var kind = scope.kind & Reflection_1.ReflectionKind.ClassOrInterface ? Reflection_1.ReflectionKind.Method : Reflection_1.ReflectionKind.Function;
        var hasBody = !!node.body;
        var method = declaration_1.createDeclaration(context, node, kind);
        context.withScope(method, function () {
            if (!hasBody || !method.signatures) {
                var signature = signature_1.createSignature(context, node, method.name, Reflection_1.ReflectionKind.CallSignature);
                if (!method.signatures)
                    method.signatures = [];
                method.signatures.push(signature);
            }
            else {
                context.trigger(Converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    };
    return FunctionConverter;
})();
exports.FunctionConverter = FunctionConverter;
