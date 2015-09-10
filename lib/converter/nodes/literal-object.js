var ts = require("typescript");
var convert_node_1 = require("../convert-node");
var ObjectLiteralConverter = (function () {
    function ObjectLiteralConverter() {
        this.supports = [
            163
        ];
    }
    ObjectLiteralConverter.prototype.convert = function (context, node) {
        if (node.properties) {
            node.properties.forEach(function (node) {
                convert_node_1.convertNode(context, node);
            });
        }
        return context.scope;
    };
    return ObjectLiteralConverter;
})();
exports.ObjectLiteralConverter = ObjectLiteralConverter;
