var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var AccessorConverter = (function () {
    function AccessorConverter() {
        this.supports = [
            143,
            144
        ];
    }
    AccessorConverter.prototype.convert = function (context, node) {
        var accessor = index_2.createDeclaration(context, node, index_1.ReflectionKind.Accessor);
        context.withScope(accessor, function () {
            if (node.kind == 143) {
                accessor.getSignature = index_2.createSignature(context, node, '__get', index_1.ReflectionKind.GetSignature);
            }
            else {
                accessor.setSignature = index_2.createSignature(context, node, '__set', index_1.ReflectionKind.SetSignature);
            }
        });
        return accessor;
    };
    return AccessorConverter;
})();
exports.AccessorConverter = AccessorConverter;
