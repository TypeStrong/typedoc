var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var SignatureConverter = (function () {
    function SignatureConverter() {
        this.supports = [
            145,
            150,
            171,
            172
        ];
    }
    SignatureConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        if (scope instanceof index_1.DeclarationReflection) {
            var name = scope.kindOf(index_1.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            var signature = index_2.createSignature(context, node, name, index_1.ReflectionKind.CallSignature);
            if (!scope.signatures)
                scope.signatures = [];
            scope.signatures.push(signature);
        }
        return scope;
    };
    return SignatureConverter;
})();
exports.SignatureConverter = SignatureConverter;
