var ts = require("typescript");
var index_1 = require("../factories/index");
var EnumConverter = (function () {
    function EnumConverter() {
    }
    EnumConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 128);
    };
    EnumConverter.prototype.convertType = function (context, type) {
        return index_1.createReferenceType(context, type.symbol);
    };
    return EnumConverter;
})();
exports.EnumConverter = EnumConverter;
