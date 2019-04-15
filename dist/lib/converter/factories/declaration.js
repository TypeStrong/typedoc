"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/index");
const converter_1 = require("../converter");
const reference_1 = require("./reference");
const nonStaticKinds = [
    index_1.ReflectionKind.Class,
    index_1.ReflectionKind.Interface,
    index_1.ReflectionKind.Module
];
const nonStaticMergeKinds = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.ClassExpression,
    ts.SyntaxKind.InterfaceDeclaration
];
function createDeclaration(context, node, kind, name) {
    if (!(context.scope instanceof index_1.ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }
    const container = context.scope;
    if (!name) {
        if (node.localSymbol) {
            name = node.localSymbol.name;
        }
        else if (node.symbol) {
            name = node.symbol.name;
        }
        else {
            return;
        }
    }
    const modifiers = ts.getCombinedModifierFlags(node);
    let isExported;
    if (container.kindOf([index_1.ReflectionKind.Module, index_1.ReflectionKind.ExternalModule])) {
        isExported = false;
    }
    else {
        isExported = container.flags.isExported;
    }
    if (kind === index_1.ReflectionKind.ExternalModule) {
        isExported = true;
    }
    else if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
        const parentModifiers = ts.getCombinedModifierFlags(node.parent.parent);
        isExported = isExported || !!(parentModifiers & ts.ModifierFlags.Export);
    }
    else {
        isExported = isExported || !!(modifiers & ts.ModifierFlags.Export);
    }
    if (!isExported && context.converter.excludeNotExported) {
        return;
    }
    const isPrivate = !!(modifiers & ts.ModifierFlags.Private);
    if (context.isInherit && isPrivate) {
        return;
    }
    let isConstructorProperty = false;
    let isStatic = false;
    if (!nonStaticKinds.includes(kind)) {
        isStatic = !!(modifiers & ts.ModifierFlags.Static);
        if (container.kind === index_1.ReflectionKind.Class) {
            if (node.parent && node.parent.kind === ts.SyntaxKind.Constructor) {
                isConstructorProperty = true;
            }
            else if (!node.parent || !nonStaticMergeKinds.includes(node.parent.kind)) {
                isStatic = true;
            }
        }
    }
    let child;
    const children = container.children = container.children || [];
    children.forEach((n) => {
        if (n.name === name && n.flags.isStatic === isStatic && canMergeReflectionsByKind(n.kind, kind)) {
            child = n;
        }
    });
    if (!child) {
        child = new index_1.DeclarationReflection(name, kind, container);
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
    const modifiers = ts.getCombinedModifierFlags(node);
    reflection.setFlag(index_1.ReflectionFlag.External, context.isExternal);
    reflection.setFlag(index_1.ReflectionFlag.Protected, !!(modifiers & ts.ModifierFlags.Protected));
    reflection.setFlag(index_1.ReflectionFlag.Public, !!(modifiers & ts.ModifierFlags.Public));
    reflection.setFlag(index_1.ReflectionFlag.Optional, !!(node['questionToken']));
    if (context.isInherit &&
        (node.parent === context.inheritParent || reflection.flags.isConstructorProperty)) {
        if (!reflection.inheritedFrom) {
            reflection.inheritedFrom = reference_1.createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach((signature) => {
                signature.inheritedFrom = reference_1.createReferenceType(context, node.symbol, true);
            });
        }
    }
    return reflection;
}
function canMergeReflectionsByKind(kind1, kind2) {
    if ((kind1 & index_1.ReflectionKind.SomeType && kind2 & index_1.ReflectionKind.SomeValue)
        ||
            (kind2 & index_1.ReflectionKind.SomeType && kind1 & index_1.ReflectionKind.SomeValue)) {
        return false;
    }
    return true;
}
function mergeDeclarations(context, reflection, node, kind) {
    if (reflection.kind !== kind) {
        const weights = [index_1.ReflectionKind.Module, index_1.ReflectionKind.Enum, index_1.ReflectionKind.Class];
        const kindWeight = weights.indexOf(kind);
        const childKindWeight = weights.indexOf(reflection.kind);
        if (kindWeight > childKindWeight) {
            reflection.kind = kind;
        }
    }
    if (context.isInherit &&
        (context.inherited || []).includes(reflection.name) &&
        (node.parent === context.inheritParent || reflection.flags.isConstructorProperty)) {
        if (!reflection.overwrites) {
            reflection.overwrites = reference_1.createReferenceType(context, node.symbol, true);
            reflection.getAllSignatures().forEach((signature) => {
                signature.overwrites = reference_1.createReferenceType(context, node.symbol, true);
            });
        }
        return;
    }
    return reflection;
}
//# sourceMappingURL=declaration.js.map