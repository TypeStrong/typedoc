var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var index_3 = require("../index");
var AliasConverter = (function () {
    function AliasConverter() {
        this.supports = [
            214
        ];
    }
    AliasConverter.prototype.convert = function (context, node) {
        var alias = index_2.createDeclaration(context, node, index_1.ReflectionKind.TypeAlias);
        context.withScope(alias, function () {
            alias.type = index_3.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });
        return alias;
    };
    return AliasConverter;
})();
exports.AliasConverter = AliasConverter;
