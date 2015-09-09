var UnknownType_1 = require("../../../models/types/UnknownType");
var UnknownConverter = (function () {
    function UnknownConverter() {
        this.priority = -100;
    }
    UnknownConverter.prototype.supportsType = function (context, type) {
        return true;
    };
    UnknownConverter.prototype.convertType = function (context, type) {
        var name = context.checker.typeToString(type);
        return new UnknownType_1.UnknownType(name);
    };
    return UnknownConverter;
})();
exports.UnknownConverter = UnknownConverter;
