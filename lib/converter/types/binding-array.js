var ts = require("typescript");
var index_1 = require("../../models/index");
var convert_type_1 = require("../convert-type");
var BindingArrayConverter = (function () {
    function BindingArrayConverter() {
    }
    BindingArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 160;
    };
    BindingArrayConverter.prototype.convertNode = function (context, node) {
        var types = [];
        node.elements.forEach(function (element) {
            types.push(convert_type_1.convertType(context, element));
        });
        return new index_1.TupleType(types);
    };
    return BindingArrayConverter;
})();
exports.BindingArrayConverter = BindingArrayConverter;
