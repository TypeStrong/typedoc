var ts = require("typescript");
var index_1 = require("../../models/types/index");
var convert_type_1 = require("../convert-type");
var TupleConverter = (function () {
    function TupleConverter() {
    }
    TupleConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 155;
    };
    TupleConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 8192);
    };
    TupleConverter.prototype.convertNode = function (context, node) {
        var elements;
        if (node.elementTypes) {
            elements = node.elementTypes.map(function (n) { return convert_type_1.convertType(context, n); });
        }
        else {
            elements = [];
        }
        return new index_1.TupleType(elements);
    };
    TupleConverter.prototype.convertType = function (context, type) {
        var elements;
        if (type.elementTypes) {
            elements = type.elementTypes.map(function (t) { return convert_type_1.convertType(context, null, t); });
        }
        else {
            elements = [];
        }
        return new index_1.TupleType(elements);
    };
    return TupleConverter;
})();
exports.TupleConverter = TupleConverter;
