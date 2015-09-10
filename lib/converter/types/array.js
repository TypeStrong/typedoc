var ts = require("typescript");
var index_1 = require("../../models/index");
var convert_type_1 = require("../convert-type");
var ArrayConverter = (function () {
    function ArrayConverter() {
    }
    ArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 154;
    };
    ArrayConverter.prototype.convertNode = function (context, node) {
        var result = convert_type_1.convertType(context, node.elementType);
        if (result) {
            result.isArray = true;
        }
        else {
            result = new index_1.IntrinsicType('Array');
        }
        return result;
    };
    return ArrayConverter;
})();
exports.ArrayConverter = ArrayConverter;
