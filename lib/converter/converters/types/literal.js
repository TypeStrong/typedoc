var ts = require("typescript");
var StringLiteralType_1 = require("../../../models/types/StringLiteralType");
var LiteralConverter = (function () {
    function LiteralConverter() {
    }
    LiteralConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 9;
    };
    LiteralConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 256);
    };
    LiteralConverter.prototype.convertNode = function (context, node) {
        return new StringLiteralType_1.StringLiteralType(node.text);
    };
    LiteralConverter.prototype.convertType = function (context, type) {
        return new StringLiteralType_1.StringLiteralType(type.text);
    };
    return LiteralConverter;
})();
exports.LiteralConverter = LiteralConverter;
