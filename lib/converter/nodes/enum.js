var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var index_3 = require("../index");
var EnumConverter = (function () {
    function EnumConverter() {
        this.supports = [
            215
        ];
    }
    EnumConverter.prototype.convert = function (context, node) {
        var _this = this;
        var enumeration = index_2.createDeclaration(context, node, index_1.ReflectionKind.Enum);
        context.withScope(enumeration, function () {
            if (node.members) {
                for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                    var member = _a[_i];
                    _this.convertMember(context, member);
                }
            }
        });
        return enumeration;
    };
    EnumConverter.prototype.convertMember = function (context, node) {
        var member = index_2.createDeclaration(context, node, index_1.ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = index_3.convertDefaultValue(node);
        }
        return member;
    };
    return EnumConverter;
})();
exports.EnumConverter = EnumConverter;
