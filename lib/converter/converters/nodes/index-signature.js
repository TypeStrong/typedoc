var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var DeclarationReflection_1 = require("../../../models/reflections/DeclarationReflection");
var signature_1 = require("../factories/signature");
var IndexSignatureConverter = (function () {
    function IndexSignatureConverter() {
        this.supports = [
            147
        ];
    }
    IndexSignatureConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        if (scope instanceof DeclarationReflection_1.DeclarationReflection) {
            scope.indexSignature = signature_1.createSignature(context, node, '__index', Reflection_1.ReflectionKind.IndexSignature);
        }
        return scope;
    };
    return IndexSignatureConverter;
})();
exports.IndexSignatureConverter = IndexSignatureConverter;
