var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var DeclarationReflection_1 = require("../../../models/reflections/DeclarationReflection");
var signature_1 = require("../factories/signature");
var SignatureConverter = (function () {
    function SignatureConverter() {
        this.supports = [
            145,
            150
        ];
    }
    SignatureConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        if (scope instanceof DeclarationReflection_1.DeclarationReflection) {
            var name = scope.kindOf(Reflection_1.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            var signature = signature_1.createSignature(context, node, name, Reflection_1.ReflectionKind.CallSignature);
            if (!scope.signatures)
                scope.signatures = [];
            scope.signatures.push(signature);
        }
        return scope;
    };
    return SignatureConverter;
})();
exports.SignatureConverter = SignatureConverter;
