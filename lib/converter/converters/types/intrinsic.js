var ts = require("typescript");
var IntrinsicType_1 = require("../../../models/types/IntrinsicType");
var IntrinsicConverter = (function () {
    function IntrinsicConverter() {
    }
    IntrinsicConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 16777343);
    };
    IntrinsicConverter.prototype.convertType = function (context, type) {
        return new IntrinsicType_1.IntrinsicType(type.intrinsicName);
    };
    return IntrinsicConverter;
})();
exports.IntrinsicConverter = IntrinsicConverter;
