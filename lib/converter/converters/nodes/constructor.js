var ts = require("typescript");
var Converter_1 = require("../../Converter");
var Reflection_1 = require("../../../models/Reflection");
var ReferenceType_1 = require("../../../models/types/ReferenceType");
var Comment_1 = require("../../../models/Comment");
var type_1 = require("../type");
var declaration_1 = require("../factories/declaration");
var signature_1 = require("../factories/signature");
var ConstructorConverter = (function () {
    function ConstructorConverter() {
        this.supports = [
            142,
            146
        ];
    }
    ConstructorConverter.prototype.convert = function (context, node) {
        var parent = context.scope;
        var hasBody = !!node.body;
        var method = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Constructor, 'constructor');
        if (!method) {
            return null;
        }
        for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
            var parameter = _a[_i];
            this.addParameterProperty(context, parameter, method.comment);
        }
        context.withScope(method, function () {
            if (!hasBody || !method.signatures) {
                var name = 'new ' + parent.name;
                var signature = signature_1.createSignature(context, node, name, Reflection_1.ReflectionKind.ConstructorSignature);
                signature.type = new ReferenceType_1.ReferenceType(parent.name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, parent);
                method.signatures = method.signatures || [];
                method.signatures.push(signature);
            }
            else {
                context.trigger(Converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    };
    ConstructorConverter.prototype.addParameterProperty = function (context, parameter, comment) {
        var visibility = parameter.flags & (16 | 64 | 32);
        if (!visibility)
            return;
        var property = declaration_1.createDeclaration(context, parameter, Reflection_1.ReflectionKind.Property);
        if (!property)
            return;
        property.setFlag(Reflection_1.ReflectionFlag.Static, false);
        property.type = type_1.convertType(context, parameter.type, context.getTypeAtLocation(parameter));
        if (comment) {
            var tag = comment.getTag('param', property.name);
            if (tag && tag.text) {
                property.comment = new Comment_1.Comment(tag.text);
            }
        }
    };
    return ConstructorConverter;
})();
exports.ConstructorConverter = ConstructorConverter;
