var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var converter_1 = require("../converter");
var FunctionConverter = (function () {
    function FunctionConverter() {
        this.supports = [
            140,
            141,
            211
        ];
    }
    FunctionConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        var kind = scope.kind & index_1.ReflectionKind.ClassOrInterface ? index_1.ReflectionKind.Method : index_1.ReflectionKind.Function;
        var hasBody = !!node.body;
        var method = index_2.createDeclaration(context, node, kind);
        context.withScope(method, function () {
            if (!hasBody || !method.signatures) {
                var signature = index_2.createSignature(context, node, method.name, index_1.ReflectionKind.CallSignature);
                if (!method.signatures)
                    method.signatures = [];
                method.signatures.push(signature);
            }
            else {
                context.trigger(converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    };
    return FunctionConverter;
})();
exports.FunctionConverter = FunctionConverter;
