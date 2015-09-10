var ts = require("typescript");
var index_1 = require("../../models/types/index");
var convert_type_1 = require("../convert-type");
var UnionConverter = (function () {
    function UnionConverter() {
    }
    UnionConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 156;
    };
    UnionConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 16384);
    };
    UnionConverter.prototype.convertNode = function (context, node) {
        var types = [];
        if (node.types) {
            types = node.types.map(function (n) { return convert_type_1.convertType(context, n); });
        }
        else {
            types = [];
        }
        return new index_1.UnionType(types);
    };
    UnionConverter.prototype.convertType = function (context, type) {
        var types;
        if (type && type.types) {
            types = type.types.map(function (t) { return convert_type_1.convertType(context, null, t); });
        }
        else {
            types = [];
        }
        return new index_1.UnionType(types);
    };
    return UnionConverter;
})();
exports.UnionConverter = UnionConverter;
