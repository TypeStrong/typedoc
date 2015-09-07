var ts = require("typescript");
var Converter_1 = require("../Converter");
var Reflection_1 = require("../../models/Reflection");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var ContainerReflection_1 = require("../../models/reflections/ContainerReflection");
var ReferenceType_1 = require("../../models/types/ReferenceType");
var SignatureReflection_1 = require("../../models/reflections/SignatureReflection");
var convertNode_1 = require("./convertNode");
var convertType_1 = require("./convertType");
var ParameterReflection_1 = require("../../models/reflections/ParameterReflection");
var TypeParameterType_1 = require("../../models/types/TypeParameterType");
var TypeParameterReflection_1 = require("../../models/reflections/TypeParameterReflection");
var nonStaticKinds = [
    Reflection_1.ReflectionKind.Class,
    Reflection_1.ReflectionKind.Interface,
    Reflection_1.ReflectionKind.Module
];
function createDeclaration(context, node, kind, name) {
    var container = context.scope;
    if (!(container instanceof ContainerReflection_1.ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }
    if (!name) {
        if (!node.symbol)
            return null;
        name = node.symbol.name;
    }
    var isExported = container.kindOf(Reflection_1.ReflectionKind.Module) ? false : container.flags.isExported;
    if (node.parent && node.parent.kind == 200) {
        isExported = isExported || !!(node.parent.parent.flags & 1);
    }
    else {
        isExported = isExported || !!(node.flags & 1);
    }
    if (!isExported && context.getOptions().excludeNotExported) {
        return null;
    }
    var isPrivate = !!(node.flags & 32);
    if (context.isInherit && isPrivate) {
        return null;
    }
    var isConstructorProperty = false;
    var isStatic = false;
    if (nonStaticKinds.indexOf(kind) == -1) {
        isStatic = !!(node.flags & 128);
        if (container.kind == Reflection_1.ReflectionKind.Class) {
            if (node.parent && node.parent.kind == 136) {
                isConstructorProperty = true;
            }
            else if (!node.parent || node.parent.kind != 202) {
                isStatic = true;
            }
        }
    }
    var child;
    var children = container.children = container.children || [];
    children.forEach(function (n) {
        if (n.name == name && n.flags.isStatic == isStatic)
            child = n;
    });
    if (!child) {
        child = new DeclarationReflection_1.DeclarationReflection(container, name, kind);
        child.setFlag(Reflection_1.ReflectionFlag.Static, isStatic);
        child.setFlag(Reflection_1.ReflectionFlag.Private, isPrivate);
        child.setFlag(Reflection_1.ReflectionFlag.ConstructorProperty, isConstructorProperty);
        child.setFlag(Reflection_1.ReflectionFlag.Exported, isExported);
        child = setupDeclaration(context, child, node);
        if (child) {
            children.push(child);
            context.registerReflection(child, node);
        }
    }
    else {
        child = mergeDeclarations(context, child, node, kind);
    }
    if (child) {
        context.trigger(Converter_1.Converter.EVENT_CREATE_DECLARATION, child, node);
    }
    return child;
}
exports.createDeclaration = createDeclaration;
function setupDeclaration(context, reflection, node) {
    reflection.setFlag(Reflection_1.ReflectionFlag.External, context.isExternal);
    reflection.setFlag(Reflection_1.ReflectionFlag.Protected, !!(node.flags & 64));
    reflection.setFlag(Reflection_1.ReflectionFlag.Public, !!(node.flags & 16));
    reflection.setFlag(Reflection_1.ReflectionFlag.Optional, !!(node['questionToken']));
    if (context.isInherit &&
        (node.parent == context.inheritParent || reflection.flags.isConstructorProperty)) {
        if (!reflection.inheritedFrom) {
            reflection.inheritedFrom = createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach(function (signature) {
                signature.inheritedFrom = createReferenceType(context, node.symbol, true);
            });
        }
    }
    return reflection;
}
function mergeDeclarations(context, reflection, node, kind) {
    if (reflection.kind != kind) {
        var weights = [Reflection_1.ReflectionKind.Module, Reflection_1.ReflectionKind.Enum, Reflection_1.ReflectionKind.Class];
        var kindWeight = weights.indexOf(kind);
        var childKindWeight = weights.indexOf(reflection.kind);
        if (kindWeight > childKindWeight) {
            reflection.kind = kind;
        }
    }
    if (context.isInherit &&
        context.inherited.indexOf(reflection.name) != -1 &&
        (node.parent == context.inheritParent || reflection.flags.isConstructorProperty)) {
        if (!reflection.overwrites) {
            reflection.overwrites = createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach(function (signature) {
                signature.overwrites = createReferenceType(context, node.symbol, true);
            });
        }
        return null;
    }
    return reflection;
}
function createReferenceType(context, symbol, includeParent) {
    var checker = context.checker;
    var id = context.getSymbolID(symbol);
    var name = checker.symbolToString(symbol);
    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + '.' + name;
    }
    return new ReferenceType_1.ReferenceType(name, id);
}
exports.createReferenceType = createReferenceType;
function createSignature(context, node, name, kind) {
    var container = context.scope;
    if (!(container instanceof ContainerReflection_1.ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }
    var signature = new SignatureReflection_1.SignatureReflection(container, name, kind);
    context.registerReflection(signature, node);
    context.withScope(signature, node.typeParameters, true, function () {
        node.parameters.forEach(function (parameter) {
            createParameter(context, parameter);
        });
        signature.type = extractSignatureType(context, node);
        if (container.inheritedFrom) {
            signature.inheritedFrom = createReferenceType(context, node.symbol, true);
        }
    });
    context.trigger(Converter_1.Converter.EVENT_CREATE_SIGNATURE, signature, node);
    return signature;
}
exports.createSignature = createSignature;
function extractSignatureType(context, node) {
    var checker = context.checker;
    if (node.kind & 139 || node.kind & 158) {
        try {
            var signature = checker.getSignatureFromDeclaration(node);
            return convertType_1.convertType(context, node.type, checker.getReturnTypeOfSignature(signature));
        }
        catch (error) { }
    }
    if (node.type) {
        return convertType_1.convertType(context, node.type);
    }
    else {
        return convertType_1.convertType(context, node);
    }
}
function createParameter(context, node) {
    var signature = context.scope;
    if (!(signature instanceof SignatureReflection_1.SignatureReflection)) {
        throw new Error('Expected signature reflection.');
    }
    var parameter = new ParameterReflection_1.ParameterReflection(signature, node.symbol.name, Reflection_1.ReflectionKind.Parameter);
    context.registerReflection(parameter, node);
    context.withScope(parameter, function () {
        if (ts.isBindingPattern(node.name)) {
            parameter.type = convertType_1.convertDestructuringType(context, node.name);
            parameter.name = '__namedParameters';
        }
        else {
            parameter.type = convertType_1.convertType(context, node.type, context.getTypeAtLocation(node));
        }
        parameter.defaultValue = convertNode_1.getDefaultValue(node);
        parameter.setFlag(Reflection_1.ReflectionFlag.Optional, !!node.questionToken);
        parameter.setFlag(Reflection_1.ReflectionFlag.Rest, !!node.dotDotDotToken);
        parameter.setFlag(Reflection_1.ReflectionFlag.DefaultValue, !!parameter.defaultValue);
        if (!signature.parameters)
            signature.parameters = [];
        signature.parameters.push(parameter);
    });
    context.trigger(Converter_1.Converter.EVENT_CREATE_PARAMETER, parameter, node);
    return parameter;
}
function createTypeParameter(context, node) {
    var typeParameter = new TypeParameterType_1.TypeParameterType();
    typeParameter.name = node.symbol.name;
    if (node.constraint) {
        typeParameter.constraint = convertType_1.convertType(context, node.constraint);
    }
    var reflection = context.scope;
    var typeParameterReflection = new TypeParameterReflection_1.TypeParameterReflection(reflection, typeParameter);
    if (!reflection.typeParameters)
        reflection.typeParameters = [];
    reflection.typeParameters.push(typeParameterReflection);
    context.registerReflection(typeParameterReflection, node);
    context.trigger(Converter_1.Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);
    return typeParameter;
}
exports.createTypeParameter = createTypeParameter;
