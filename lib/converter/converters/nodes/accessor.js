var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var declaration_1 = require("../factories/declaration");
var signature_1 = require("../factories/signature");
var AccessorConverter = (function () {
    function AccessorConverter() {
        this.supports = [
            143,
            144
        ];
    }
    AccessorConverter.prototype.convert = function (context, node) {
        var accessor = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Accessor);
        context.withScope(accessor, function () {
            if (node.kind == 143) {
                accessor.getSignature = signature_1.createSignature(context, node, '__get', Reflection_1.ReflectionKind.GetSignature);
            }
            else {
                accessor.setSignature = signature_1.createSignature(context, node, '__set', Reflection_1.ReflectionKind.SetSignature);
            }
        });
        return accessor;
    };
    return AccessorConverter;
})();
exports.AccessorConverter = AccessorConverter;
