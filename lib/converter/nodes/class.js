var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var index_3 = require("../index");
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
            reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Class);
        }
        context.withScope(reflection, node.typeParameters, function () {
            if (node.members) {
                node.members.forEach(function (member) {
                    index_3.convertNode(context, member);
                });
            }
            var baseType = ts.getClassExtendsHeritageClauseElement(node);
            if (baseType) {
                var type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection.extendedTypes)
                        reflection.extendedTypes = [];
                    reflection.extendedTypes.push(index_3.convertType(context, baseType, type));
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
                    reflection.implementedTypes.push(index_3.convertType(context, implementedType));
                });
            }
        });
        return reflection;
    };
    return ClassConverter;
})();
exports.ClassConverter = ClassConverter;
