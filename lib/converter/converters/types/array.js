var ts = require("typescript");
var IntrinsicType_1 = require("../../../models/types/IntrinsicType");
var type_1 = require("../type");
var ArrayConverter = (function () {
    function ArrayConverter() {
    }
    ArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 154;
    };
    ArrayConverter.prototype.convertNode = function (context, node) {
        var result = type_1.convertType(context, node.elementType);
        if (result) {
            result.isArray = true;
        }
        else {
            result = new IntrinsicType_1.IntrinsicType('Array');
        }
        return result;
    };
    return ArrayConverter;
})();
exports.ArrayConverter = ArrayConverter;
