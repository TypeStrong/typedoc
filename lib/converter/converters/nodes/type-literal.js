var ts = require("typescript");
var node_1 = require("../node");
var TypeLiteralConverter = (function () {
    function TypeLiteralConverter() {
        this.supports = [
            153
        ];
    }
    TypeLiteralConverter.prototype.convert = function (context, node) {
        if (node.members) {
            node.members.forEach(function (node) {
                node_1.convertNode(context, node);
            });
        }
        return context.scope;
    };
    return TypeLiteralConverter;
})();
exports.TypeLiteralConverter = TypeLiteralConverter;
