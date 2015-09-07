var ts = require("typescript");
var Converter_1 = require("../Converter");
var Reflection_1 = require("../../models/Reflection");
var ReferenceType_1 = require("../../models/types/ReferenceType");
var StringLiteralType_1 = require("../../models/types/StringLiteralType");
var TupleType_1 = require("../../models/types/TupleType");
var UnionType_1 = require("../../models/types/UnionType");
var TypeParameterType_1 = require("../../models/types/TypeParameterType");
var UnknownType_1 = require("../../models/types/UnknownType");
var IntrinsicType_1 = require("../../models/types/IntrinsicType");
var ReflectionType_1 = require("../../models/types/ReflectionType");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var convertNode_1 = require("./convertNode");
var factories_1 = require("./factories");
function convertType(context, node, type) {
    if (node) {
        type = type || context.getTypeAtLocation(node);
        if (isTypeAlias(context, node, type)) {
            return convertTypeAliasNode(node);
        }
        switch (node.kind) {
            case 8:
                return convertStringLiteralExpression(node);
            case 147:
                return convertArrayTypeNode(context, node);
            case 148:
                return convertTupleTypeNode(context, node);
            case 149:
                return convertUnionTypeNode(context, node);
        }
        if (type) {
            if (type.flags & 512) {
                return convertTypeParameterNode(context, node);
            }
            else if (type.flags & 48128) {
                return convertTypeReferenceNode(context, node, type);
            }
        }
    }
    if (type) {
        if (type.flags & 1048703) {
            return convertIntrinsicType(type);
        }
        else if (type.flags & 256) {
            return convertStringLiteralType(type);
        }
        else if (type.flags & 128) {
            return convertEnumType(context, type);
        }
        else if (type.flags & 8192) {
            return convertTupleType(context, type);
        }
        else if (type.flags & 16384) {
            return convertUnionType(context, type);
        }
        else if (type.flags & 48128) {
            return convertTypeReferenceType(context, type);
        }
        else {
            return convertUnknownType(context, type);
        }
    }
}
exports.convertType = convertType;
function isTypeAlias(context, node, type) {
    if (!type || !node || !node.typeName)
        return false;
    if (!type.symbol)
        return true;
    var checker = context.checker;
    var symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
    if (!symbolName.length)
        return false;
    if (symbolName[0].substr(0, 1) == '"')
        symbolName.shift();
    var nodeName = ts.getTextOfNode(node.typeName).split('.');
    if (!nodeName.length)
        return false;
    var common = Math.min(symbolName.length, nodeName.length);
    symbolName = symbolName.slice(-common);
    nodeName = nodeName.slice(-common);
    return nodeName.join('.') != symbolName.join('.');
}
function convertTypeLiteral(context, symbol, node) {
    var declaration = new DeclarationReflection_1.DeclarationReflection();
    declaration.kind = Reflection_1.ReflectionKind.TypeLiteral;
    declaration.name = '__type';
    declaration.parent = context.scope;
    context.registerReflection(declaration, null, symbol);
    context.trigger(Converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
    context.withScope(declaration, function () {
        symbol.declarations.forEach(function (node) {
            convertNode_1.visit(context, node);
        });
    });
    return new ReflectionType_1.ReflectionType(declaration);
}
function convertTypeAliasNode(node) {
    var name = ts.getTextOfNode(node.typeName);
    return new ReferenceType_1.ReferenceType(name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
}
function convertStringLiteralExpression(node) {
    return new StringLiteralType_1.StringLiteralType(node.text);
}
function convertArrayTypeNode(context, node) {
    var result = convertType(context, node.elementType);
    if (result) {
        result.isArray = true;
    }
    else {
        result = new IntrinsicType_1.IntrinsicType('Array');
    }
    return result;
}
function convertTupleTypeNode(context, node) {
    var elements;
    if (node.elementTypes) {
        elements = node.elementTypes.map(function (n) { return convertType(context, n); });
    }
    else {
        elements = [];
    }
    return new TupleType_1.TupleType(elements);
}
function convertUnionTypeNode(context, node) {
    var types = [];
    if (node.types) {
        types = node.types.map(function (n) { return convertType(context, n); });
    }
    else {
        types = [];
    }
    return new UnionType_1.UnionType(types);
}
function convertTypeParameterNode(context, node) {
    if (node.typeName) {
        var name = ts.getTextOfNode(node.typeName);
        if (context.typeParameters && context.typeParameters[name]) {
            return context.typeParameters[name].clone();
        }
        var result = new TypeParameterType_1.TypeParameterType();
        result.name = name;
        return result;
    }
}
function convertTypeReferenceNode(context, node, type) {
    if (!type.symbol) {
        return new IntrinsicType_1.IntrinsicType('Object');
    }
    else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
        return convertTypeLiteral(context, type.symbol, node);
    }
    var result = factories_1.createReferenceType(context, type.symbol);
    if (node.typeArguments) {
        result.typeArguments = node.typeArguments.map(function (n) { return convertType(context, n); });
    }
    return result;
}
function convertIntrinsicType(type) {
    return new IntrinsicType_1.IntrinsicType(type.intrinsicName);
}
function convertStringLiteralType(type) {
    return new StringLiteralType_1.StringLiteralType(type.text);
}
function convertUnknownType(context, type) {
    var name = context.checker.typeToString(type);
    return new UnknownType_1.UnknownType(name);
}
function convertEnumType(context, type) {
    return factories_1.createReferenceType(context, type.symbol);
}
function convertTupleType(context, type) {
    var elements;
    if (type.elementTypes) {
        elements = type.elementTypes.map(function (t) { return convertType(context, null, t); });
    }
    else {
        elements = [];
    }
    return new TupleType_1.TupleType(elements);
}
function convertUnionType(context, type) {
    var types;
    if (type && type.types) {
        types = type.types.map(function (t) { return convertType(context, null, t); });
    }
    else {
        types = [];
    }
    return new UnionType_1.UnionType(types);
}
function convertTypeReferenceType(context, type) {
    if (!type.symbol) {
        return new IntrinsicType_1.IntrinsicType('Object');
    }
    else if (type.symbol.flags & 2048 || type.symbol.flags & 4096) {
        return convertTypeLiteral(context, type.symbol);
    }
    var result = factories_1.createReferenceType(context, type.symbol);
    if (type.typeArguments) {
        result.typeArguments = type.typeArguments.map(function (t) { return convertType(context, null, t); });
    }
    return result;
}
function convertDestructuringType(context, node) {
    if (node.kind == 152) {
        var types = [];
        node.elements.forEach(function (element) {
            types.push(convertType(context, element));
        });
        return new TupleType_1.TupleType(types);
    }
    else {
        var declaration = new DeclarationReflection_1.DeclarationReflection();
        declaration.kind = Reflection_1.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null);
        context.trigger(Converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            node.elements.forEach(function (element) {
                convertNode_1.visit(context, element);
            });
        });
        return new ReflectionType_1.ReflectionType(declaration);
    }
}
exports.convertDestructuringType = convertDestructuringType;
