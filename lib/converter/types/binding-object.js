var ts = require("typescript");
var index_1 = require("../../models/index");
var converter_1 = require("../converter");
var index_2 = require("../index");
var BindingObjectConverter = (function () {
    function BindingObjectConverter() {
    }
    BindingObjectConverter.prototype.supportsNode = function (context, node) {
        return node.kind == 159;
    };
    BindingObjectConverter.prototype.convertNode = function (context, node) {
        var declaration = new index_1.DeclarationReflection();
        declaration.kind = index_1.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            node.elements.forEach(function (element) {
                index_2.convertNode(context, element);
            });
        });
        return new index_1.ReflectionType(declaration);
    };
    return BindingObjectConverter;
})();
exports.BindingObjectConverter = BindingObjectConverter;
