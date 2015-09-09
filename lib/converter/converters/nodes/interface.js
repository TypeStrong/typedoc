var ts = require("typescript");
var Reflection_1 = require("../../../models/Reflection");
var node_1 = require("../node");
var declaration_1 = require("../factories/declaration");
var type_1 = require("../type");
var InterfaceConverter = (function () {
    function InterfaceConverter() {
        this.supports = [
            213
        ];
    }
    InterfaceConverter.prototype.convert = function (context, node) {
        var reflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = context.scope;
        }
        else {
            reflection = declaration_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Interface);
        }
        context.withScope(reflection, node.typeParameters, function () {
            if (node.members) {
                node.members.forEach(function (member, isInherit) {
                    node_1.convertNode(context, member);
                });
            }
            var baseTypes = ts.getInterfaceBaseTypeNodes(node);
            if (baseTypes) {
                baseTypes.forEach(function (baseType) {
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
                });
            }
        });
        return reflection;
    };
    return InterfaceConverter;
})();
exports.InterfaceConverter = InterfaceConverter;
