var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var type_1 = require("../type");
var declaration_1 = require("../factories/declaration");
var AliasConverter = (function () {
    function AliasConverter() {
        this.supports = [
            214
        ];
    }
    AliasConverter.prototype.convert = function (context, node) {
        var alias = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.TypeAlias);
        context.withScope(alias, function () {
            alias.type = type_1.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });
        return alias;
    };
    return AliasConverter;
})();
exports.AliasConverter = AliasConverter;
