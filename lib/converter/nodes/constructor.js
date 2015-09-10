var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var converter_1 = require("../converter");
var index_3 = require("../index");
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
        var method = index_2.createDeclaration(context, node, index_1.ReflectionKind.Constructor, 'constructor');
        if (node.parameters && node.parameters.length) {
            var comment = method ? method.comment : index_2.createComment(node);
            for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
                var parameter = _a[_i];
                this.addParameterProperty(context, parameter, comment);
            }
        }
        context.withScope(method, function () {
            if (!hasBody || !method.signatures) {
                var name = 'new ' + parent.name;
                var signature = index_2.createSignature(context, node, name, index_1.ReflectionKind.ConstructorSignature);
                signature.type = new index_1.ReferenceType(parent.name, index_1.ReferenceType.SYMBOL_ID_RESOLVED, parent);
                method.signatures = method.signatures || [];
                method.signatures.push(signature);
            }
            else {
                context.trigger(converter_1.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });
        return method;
    };
    ConstructorConverter.prototype.addParameterProperty = function (context, parameter, comment) {
        var visibility = parameter.flags & (16 | 64 | 32);
        if (!visibility)
            return;
        var property = index_2.createDeclaration(context, parameter, index_1.ReflectionKind.Property);
        if (!property)
            return;
        property.setFlag(index_1.ReflectionFlag.Static, false);
        property.type = index_3.convertType(context, parameter.type, context.getTypeAtLocation(parameter));
        if (comment) {
            var tag = comment.getTag('param', property.name);
            if (tag && tag.text) {
                property.comment = new index_1.Comment(tag.text);
            }
        }
    };
    return ConstructorConverter;
})();
exports.ConstructorConverter = ConstructorConverter;
