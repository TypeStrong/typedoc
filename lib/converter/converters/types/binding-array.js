var ts = require("typescript");
var type_1 = require("../type");
var TupleType_1 = require("../../../models/types/TupleType");
var BindingArrayConverter = (function () {
    function BindingArrayConverter() {
    }
    BindingArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 160;
    };
    BindingArrayConverter.prototype.convertNode = function (context, node) {
        var types = [];
        node.elements.forEach(function (element) {
            types.push(type_1.convertType(context, element));
        });
        return new TupleType_1.TupleType(types);
    };
    return BindingArrayConverter;
})();
exports.BindingArrayConverter = BindingArrayConverter;
