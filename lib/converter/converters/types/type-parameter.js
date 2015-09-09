var ts = require("typescript");
var TypeParameterType_1 = require("../../../models/types/TypeParameterType");
var TypeParameterConverter = (function () {
    function TypeParameterConverter() {
        this.priority = -50;
    }
    TypeParameterConverter.prototype.supportsNode = function (context, node, type) {
        return !!(type.flags & 512);
    };
    TypeParameterConverter.prototype.convertNode = function (context, node) {
        if (node.typeName) {
            var name = ts.getTextOfNode(node.typeName);
            if (context.typeParameters && context.typeParameters[name]) {
                return context.typeParameters[name].clone();
            }
            var result = new TypeParameterType_1.TypeParameterType();
            result.name = name;
            return result;
        }
    };
    return TypeParameterConverter;
})();
exports.TypeParameterConverter = TypeParameterConverter;
