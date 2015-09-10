var ts = require("typescript");
var index_1 = require("../../models/types/index");
var index_2 = require("../../models/reflections/index");
var index_3 = require("../factories/index");
var converter_1 = require("../converter");
var index_4 = require("../index");
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
    ReferenceConverter.prototype.convertNode = function (context, node, type) {
        if (!type.symbol) {
            return new index_1.IntrinsicType('Object');
        }
        else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
            return this.convertLiteral(context, type.symbol, node);
        }
        var result = index_3.createReferenceType(context, type.symbol);
        if (node.typeArguments) {
            result.typeArguments = node.typeArguments.map(function (n) { return index_4.convertType(context, n); });
        }
        return result;
    };
    ReferenceConverter.prototype.convertType = function (context, type) {
        if (!type.symbol) {
            return new index_1.IntrinsicType('Object');
        }
        else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
            return this.convertLiteral(context, type.symbol);
        }
        var result = index_3.createReferenceType(context, type.symbol);
        if (type.typeArguments) {
            result.typeArguments = type.typeArguments.map(function (t) { return index_4.convertType(context, null, t); });
        }
        return result;
    };
    ReferenceConverter.prototype.convertLiteral = function (context, symbol, node) {
        for (var _i = 0, _a = symbol.declarations; _i < _a.length; _i++) {
            var declaration_1 = _a[_i];
            if (context.visitStack.indexOf(declaration_1) !== -1) {
                if (declaration_1.kind == 153 ||
                    declaration_1.kind == 163) {
                    return index_3.createReferenceType(context, declaration_1.parent.symbol);
                }
                else {
                    return index_3.createReferenceType(context, declaration_1.symbol);
                }
            }
        }
        var declaration = new index_2.DeclarationReflection();
        declaration.kind = index_2.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null, symbol);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            symbol.declarations.forEach(function (node) {
                index_4.convertNode(context, node);
            });
        });
        return new index_1.ReflectionType(declaration);
    };
    return ReferenceConverter;
})();
exports.ReferenceConverter = ReferenceConverter;
