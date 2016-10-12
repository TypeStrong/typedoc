"use strict";
var ts = require("typescript");
var index_1 = require("../../models/index");
var converter_1 = require("../converter");
var reference_1 = require("./reference");
var nonStaticKinds = [
    index_1.ReflectionKind.Class,
    index_1.ReflectionKind.Interface,
    index_1.ReflectionKind.Module
];
function createDeclaration(context, node, kind, name) {
    var container = context.scope;
    if (!(container instanceof index_1.ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }
    if (!name) {
        if (node.localSymbol) {
            name = node.localSymbol.name;
        }
        else if (node.symbol) {
            name = node.symbol.name;
        }
        else {
            return null;
        }
    }
    var isExported;
    if (container.kindOf([index_1.ReflectionKind.Module, index_1.ReflectionKind.ExternalModule])) {
        isExported = false;
    }
    else {
        isExported = container.flags.isExported;
    }
    if (kind == index_1.ReflectionKind.ExternalModule) {
        isExported = true;
    }
    else if (node.parent && node.parent.kind == 219) {
        isExported = isExported || !!(node.parent.parent.flags & 1);
    }
    else {
        isExported = isExported || !!(node.flags & 1);
    }
    if (!isExported && context.converter.excludeNotExported) {
        return null;
    }
    var isPrivate = !!(node.flags & 8);
    if (context.isInherit && isPrivate) {
        return null;
    }
    var isConstructorProperty = false;
    var isStatic = false;
    if (nonStaticKinds.indexOf(kind) == -1) {
        isStatic = !!(node.flags & 32);
        if (container.kind == index_1.ReflectionKind.Class) {
            if (node.parent && node.parent.kind == 148) {
                isConstructorProperty = true;
            }
            else if (!node.parent || node.parent.kind != 221) {
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
        child = new index_1.DeclarationReflection(container, name, kind);
        child.setFlag(index_1.ReflectionFlag.Static, isStatic);
        child.setFlag(index_1.ReflectionFlag.Private, isPrivate);
        child.setFlag(index_1.ReflectionFlag.ConstructorProperty, isConstructorProperty);
        child.setFlag(index_1.ReflectionFlag.Exported, isExported);
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
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, child, node);
    }
    return child;
}
exports.createDeclaration = createDeclaration;
function setupDeclaration(context, reflection, node) {
    reflection.setFlag(index_1.ReflectionFlag.External, context.isExternal);
    reflection.setFlag(index_1.ReflectionFlag.Protected, !!(node.flags & 16));
    reflection.setFlag(index_1.ReflectionFlag.Public, !!(node.flags & 4));
    reflection.setFlag(index_1.ReflectionFlag.Optional, !!(node['questionToken']));
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
        var weights = [index_1.ReflectionKind.Module, index_1.ReflectionKind.Enum, index_1.ReflectionKind.Class];
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
//# sourceMappingURL=declaration.js.map