var ts = require("typescript");
var Converter_1 = require("../../Converter");
var Reflection_1 = require("../../../models/Reflection");
var ContainerReflection_1 = require("../../../models/reflections/ContainerReflection");
var DeclarationReflection_1 = require("../../../models/reflections/DeclarationReflection");
var reference_1 = require("./reference");
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
    if (node.parent && node.parent.kind == 210) {
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
            if (node.parent && node.parent.kind == 142) {
                isConstructorProperty = true;
            }
            else if (!node.parent || node.parent.kind != 212) {
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
            reflection.inheritedFrom = reference_1.createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach(function (signature) {
                signature.inheritedFrom = reference_1.createReferenceType(context, node.symbol, true);
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
            reflection.overwrites = reference_1.createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach(function (signature) {
                signature.overwrites = reference_1.createReferenceType(context, node.symbol, true);
            });
        }
        return null;
    }
    return reflection;
}
