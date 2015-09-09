var ts = require("typescript");
var Converter_1 = require("../../Converter");
var node_1 = require("../node");
var type_1 = require("../type");
var IntrinsicType_1 = require("../../../models/types/IntrinsicType");
var Reflection_1 = require("../../../models/Reflection");
var ReflectionType_1 = require("../../../models/types/ReflectionType");
var DeclarationReflection_1 = require("../../../models/reflections/DeclarationReflection");
DeclarationReflection_1.DeclarationReflection;
var reference_1 = require("../factories/reference");
var ReferenceConverter = (function () {
    function ReferenceConverter() {
        this.priority = -50;
    }
    ReferenceConverter.prototype.supportsNode = function (context, node, type) {
        return !!(type.flags & 80896);
    };
    ReferenceConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 80896);
    };
    ReferenceConverter.prototype.convert = function (context, symbol, node) {
        var declaration = new DeclarationReflection_1.DeclarationReflection();
        declaration.kind = Reflection_1.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null, symbol);
        context.trigger(Converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            symbol.declarations.forEach(function (node) {
                node_1.convertNode(context, node);
            });
        });
        return new ReflectionType_1.ReflectionType(declaration);
    };
    ReferenceConverter.prototype.convertNode = function (context, node, type) {
        if (!type.symbol) {
            return new IntrinsicType_1.IntrinsicType('Object');
        }
        else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
            return this.convert(context, type.symbol, node);
        }
        var result = reference_1.createReferenceType(context, type.symbol);
        if (node.typeArguments) {
            result.typeArguments = node.typeArguments.map(function (n) { return type_1.convertType(context, n); });
        }
        return result;
    };
    ReferenceConverter.prototype.convertType = function (context, type) {
        if (!type.symbol) {
            return new IntrinsicType_1.IntrinsicType('Object');
        }
        else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
            return this.convert(context, type.symbol);
        }
        var result = reference_1.createReferenceType(context, type.symbol);
        if (type.typeArguments) {
            result.typeArguments = type.typeArguments.map(function (t) { return type_1.convertType(context, null, t); });
        }
        return result;
    };
    return ReferenceConverter;
})();
exports.ReferenceConverter = ReferenceConverter;
