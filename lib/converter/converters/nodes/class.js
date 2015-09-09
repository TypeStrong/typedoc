var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var node_1 = require("../node");
var type_1 = require("../type");
var declaration_1 = require("../factories/declaration");
var ClassConverter = (function () {
    function ClassConverter() {
        this.supports = [
            184,
            212
        ];
    }
    ClassConverter.prototype.convert = function (context, node) {
        var reflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = context.scope;
        }
        else {
            reflection = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Class);
        }
        context.withScope(reflection, node.typeParameters, function () {
            if (node.members) {
                node.members.forEach(function (member) {
                    node_1.convertNode(context, member);
                });
            }
            var baseType = ts.getClassExtendsHeritageClauseElement(node);
            if (baseType) {
                var type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection.extendedTypes)
                        reflection.extendedTypes = [];
                    reflection.extendedTypes.push(type_1.convertType(context, baseType, type));
                }
                if (type && type.symbol) {
                    type.symbol.declarations.forEach(function (declaration) {
                        context.inherit(declaration, baseType.typeArguments);
                    });
                }
            }
            var implementedTypes = ts.getClassImplementsHeritageClauseElements(node);
            if (implementedTypes) {
                implementedTypes.forEach(function (implementedType) {
                    if (!reflection.implementedTypes) {
                        reflection.implementedTypes = [];
                    }
                    reflection.implementedTypes.push(type_1.convertType(context, implementedType));
                });
            }
        });
        return reflection;
    };
    return ClassConverter;
})();
exports.ClassConverter = ClassConverter;
