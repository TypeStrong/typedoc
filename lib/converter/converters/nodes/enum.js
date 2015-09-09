var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var declaration_1 = require("../factories/declaration");
var expression_1 = require("../expression");
var EnumConverter = (function () {
    function EnumConverter() {
        this.supports = [
            215
        ];
    }
    EnumConverter.prototype.convert = function (context, node) {
        var _this = this;
        var enumeration = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Enum);
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
        var member = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = expression_1.convertDefaultValue(node);
        }
        return member;
    };
    return EnumConverter;
})();
exports.EnumConverter = EnumConverter;
