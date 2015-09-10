var ts = require("typescript");
var index_1 = require("../../models/types/index");
var StringLiteralConverter = (function () {
    function StringLiteralConverter() {
    }
    StringLiteralConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 9;
    };
    StringLiteralConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 256);
    };
    StringLiteralConverter.prototype.convertNode = function (context, node) {
        return new index_1.StringLiteralType(node.text);
    };
    StringLiteralConverter.prototype.convertType = function (context, type) {
        return new index_1.StringLiteralType(type.text);
    };
    return StringLiteralConverter;
})();
exports.StringLiteralConverter = StringLiteralConverter;
