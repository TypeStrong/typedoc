var ts = require("typescript");
var index_1 = require("../../models/index");
var IntrinsicConverter = (function () {
    function IntrinsicConverter() {
    }
    IntrinsicConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 16777343);
    };
    IntrinsicConverter.prototype.convertType = function (context, type) {
        return new index_1.IntrinsicType(type.intrinsicName);
    };
    return IntrinsicConverter;
})();
exports.IntrinsicConverter = IntrinsicConverter;
