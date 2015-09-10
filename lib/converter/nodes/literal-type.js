var ts = require("typescript");
var convert_node_1 = require("../convert-node");
var TypeLiteralConverter = (function () {
    function TypeLiteralConverter() {
        this.supports = [
            153
        ];
    }
    TypeLiteralConverter.prototype.convert = function (context, node) {
        if (node.members) {
            node.members.forEach(function (node) {
                convert_node_1.convertNode(context, node);
            });
        }
        return context.scope;
    };
    return TypeLiteralConverter;
})();
exports.TypeLiteralConverter = TypeLiteralConverter;
