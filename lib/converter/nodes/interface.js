var ts = require("typescript");
var index_1 = require("../../models/index");
var index_2 = require("../factories/index");
var index_3 = require("../index");
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
            reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Interface);
        }
        context.withScope(reflection, node.typeParameters, function () {
            if (node.members) {
                node.members.forEach(function (member, isInherit) {
                    index_3.convertNode(context, member);
                });
            }
            var baseTypes = ts.getInterfaceBaseTypeNodes(node);
            if (baseTypes) {
                baseTypes.forEach(function (baseType) {
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
                });
            }
        });
        return reflection;
    };
    return InterfaceConverter;
})();
exports.InterfaceConverter = InterfaceConverter;
