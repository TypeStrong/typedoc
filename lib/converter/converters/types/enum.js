var ts = require("typescript");
var reference_1 = require("../factories/reference");
var EnumConverter = (function () {
    function EnumConverter() {
    }
    EnumConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 128);
    };
    EnumConverter.prototype.convertType = function (context, type) {
        return reference_1.createReferenceType(context, type.symbol);
    };
    return EnumConverter;
})();
exports.EnumConverter = EnumConverter;
