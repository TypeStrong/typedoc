var ts = require("typescript");
var Converter_1 = require("../../Converter");
var node_1 = require("../node");
var Reflection_1 = require("../../../models/Reflection");
var DeclarationReflection_1 = require("../../../models/reflections/DeclarationReflection");
var ReflectionType_1 = require("../../../models/types/ReflectionType");
var BindingObjectConverter = (function () {
    function BindingObjectConverter() {
    }
    BindingObjectConverter.prototype.supportsNode = function (context, node) {
        return node.kind == 159;
    };
    BindingObjectConverter.prototype.convertNode = function (context, node) {
        var declaration = new DeclarationReflection_1.DeclarationReflection();
        declaration.kind = Reflection_1.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null);
        context.trigger(Converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            node.elements.forEach(function (element) {
                node_1.convertNode(context, element);
            });
        });
        return new ReflectionType_1.ReflectionType(declaration);
    };
    return BindingObjectConverter;
})();
exports.BindingObjectConverter = BindingObjectConverter;
