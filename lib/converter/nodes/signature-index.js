var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var IndexSignatureConverter = (function () {
    function IndexSignatureConverter() {
        this.supports = [
            147
        ];
    }
    IndexSignatureConverter.prototype.convert = function (context, node) {
        var scope = context.scope;
        if (scope instanceof index_1.DeclarationReflection) {
            scope.indexSignature = index_2.createSignature(context, node, '__index', index_1.ReflectionKind.IndexSignature);
        }
        return scope;
    };
    return IndexSignatureConverter;
})();
exports.IndexSignatureConverter = IndexSignatureConverter;
