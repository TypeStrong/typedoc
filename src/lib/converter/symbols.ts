import * as assert from "assert";
import * as ts from "typescript";
import {
    DeclarationReflection,
    ReferenceReflection,
    Reflection,
    ReflectionFlag,
    ReflectionKind,
    TypeParameterReflection,
} from "../models";
import {
    getEnumFlags,
    hasAllFlags,
    hasAnyFlag,
    removeFlag,
} from "../utils/enum";
import type { Context } from "./context";
import { convertDefaultValue } from "./convert-expression";
import { ConverterEvents } from "./converter-events";
import { convertIndexSignature } from "./factories/index-signature";
import { createSignature } from "./factories/signature";
import { convertJsDocAlias, convertJsDocCallback } from "./jsdoc";
import { getHeritageTypes } from "./utils/nodes";
import { removeUndefined } from "./utils/reflections";

const symbolConverters: {
    [K in ts.SymbolFlags]?: (
        context: Context,
        symbol: ts.Symbol,
        exportSymbol?: ts.Symbol
    ) => void | ts.SymbolFlags;
} = {
    [ts.SymbolFlags.RegularEnum]: convertEnum,
    [ts.SymbolFlags.ConstEnum]: convertEnum,
    [ts.SymbolFlags.EnumMember]: convertEnumMember,
    [ts.SymbolFlags.ValueModule]: convertNamespace,
    [ts.SymbolFlags.NamespaceModule]: convertNamespace,
    [ts.SymbolFlags.TypeAlias]: convertTypeAlias,
    [ts.SymbolFlags.Function]: convertFunctionOrMethod,
    [ts.SymbolFlags.Method]: convertFunctionOrMethod,
    [ts.SymbolFlags.Interface]: convertClassOrInterface,
    [ts.SymbolFlags.Property]: convertProperty,
    [ts.SymbolFlags.Class]: convertClassOrInterface,
    [ts.SymbolFlags.Constructor]: convertConstructor,
    [ts.SymbolFlags.Alias]: convertAlias,
    [ts.SymbolFlags.BlockScopedVariable]: convertVariable,
    [ts.SymbolFlags.FunctionScopedVariable]: convertVariable,
    [ts.SymbolFlags.GetAccessor]: convertAccessor,
    [ts.SymbolFlags.SetAccessor]: convertAccessor,
};

const allConverterFlags = Object.keys(symbolConverters).reduce(
    (v, k) => v | +k,
    0
);

// This is kind of a hack, born of resolving references by symbols instead
// of by source location.
const conversionOrder = [
    // Do enums before namespaces so that @hidden on a namespace
    // merged with an enum works properly.
    ts.SymbolFlags.RegularEnum,
    ts.SymbolFlags.ConstEnum,
    ts.SymbolFlags.EnumMember,

    // Before type alias
    ts.SymbolFlags.BlockScopedVariable,
    ts.SymbolFlags.FunctionScopedVariable,

    ts.SymbolFlags.TypeAlias,
    ts.SymbolFlags.Function,
    ts.SymbolFlags.Method,
    ts.SymbolFlags.Interface,
    ts.SymbolFlags.Property,
    ts.SymbolFlags.Class,
    ts.SymbolFlags.Constructor,
    ts.SymbolFlags.Alias,

    ts.SymbolFlags.GetAccessor,
    ts.SymbolFlags.SetAccessor,

    ts.SymbolFlags.ValueModule,
    ts.SymbolFlags.NamespaceModule,
];

// Sanity check, if this fails a dev messed up.
for (const key of Object.keys(symbolConverters)) {
    if (!Number.isInteger(Math.log2(+key))) {
        throw new Error(
            `Symbol converter for key ${
                ts.SymbolFlags[+key]
            } does not specify a valid flag value.`
        );
    }

    if (!conversionOrder.includes(+key)) {
        throw new Error(
            `Symbol converter for key ${
                ts.SymbolFlags[+key]
            } is not specified in conversionOrder`
        );
    }
}

if (conversionOrder.reduce((a, b) => a | b, 0) !== allConverterFlags) {
    throw new Error(
        "conversionOrder contains a symbol flag that converters do not."
    );
}

export function convertSymbol(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
): void {
    if (context.shouldIgnore(symbol)) {
        return;
    }

    // This check can catch symbols which ought to be documented as references
    // but aren't aliased symbols because `export *` was used.
    const previous = context.project.getReflectionFromSymbol(symbol);
    if (
        previous &&
        previous.parent?.kindOf(ReflectionKind.Module | ReflectionKind.Project)
    ) {
        createAlias(previous, context, symbol, exportSymbol);
        return;
    }

    let flags = removeFlag(
        symbol.flags,
        ts.SymbolFlags.Transient |
            ts.SymbolFlags.Assignment |
            ts.SymbolFlags.Optional |
            ts.SymbolFlags.Prototype
    );

    // Declaration merging - the only type (excluding enum/enum, ns/ns, etc)
    // that TD supports is merging a class and interface. All others are
    // represented as multiple reflections
    if (hasAllFlags(symbol.flags, ts.SymbolFlags.Class)) {
        flags = removeFlag(
            flags,
            ts.SymbolFlags.Interface | ts.SymbolFlags.Function
        );
    }

    // Kind of declaration merging... we treat this as a property with get/set signatures.
    if (hasAllFlags(symbol.flags, ts.SymbolFlags.GetAccessor)) {
        flags = removeFlag(flags, ts.SymbolFlags.SetAccessor);
    }

    if (hasAllFlags(symbol.flags, ts.SymbolFlags.NamespaceModule)) {
        // This might be here if a namespace is declared several times.
        flags = removeFlag(flags, ts.SymbolFlags.ValueModule);
    }

    if (
        hasAnyFlag(
            symbol.flags,
            ts.SymbolFlags.Method |
                ts.SymbolFlags.Interface |
                ts.SymbolFlags.Class |
                ts.SymbolFlags.Variable
        )
    ) {
        // This happens when someone declares an object with methods:
        // { methodProperty() {} }
        flags = removeFlag(flags, ts.SymbolFlags.Property);
    }

    // A default exported function with no associated variable is a property, but
    // we should really convert it as a variable for documentation purposes
    // export default () => {}
    // export default 123
    if (
        flags === ts.SymbolFlags.Property &&
        symbol.name === "default" &&
        context.scope.kindOf(ReflectionKind.Module | ReflectionKind.Project)
    ) {
        flags = ts.SymbolFlags.BlockScopedVariable;
    }

    for (const flag of getEnumFlags(flags ^ allConverterFlags)) {
        if (!(flag & allConverterFlags)) {
            context.logger.verbose(
                `Missing converter for symbol: ${symbol.name} with flag ${ts.SymbolFlags[flag]}`
            );
        }
    }

    // Note: This method does not allow skipping earlier converters.
    // For now, this is fine... might not be flexible enough in the future.
    let skip = 0;
    for (const flag of conversionOrder) {
        if (!(flag & flags)) continue;
        if (skip & flag) continue;

        skip |= symbolConverters[flag]?.(context, symbol, exportSymbol) || 0;
    }
}

function convertSymbols(context: Context, symbols: readonly ts.Symbol[]) {
    for (const symbol of symbols) {
        convertSymbol(context, symbol);
    }
}

function convertEnum(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Enum,
        symbol,
        exportSymbol
    );

    if (symbol.flags & ts.SymbolFlags.ConstEnum) {
        reflection.setFlag(ReflectionFlag.Const);
    }

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    convertSymbols(
        context.withScope(reflection),
        context.checker
            .getExportsOfModule(symbol)
            .filter((s) => s.flags & ts.SymbolFlags.EnumMember)
    );
}

function convertEnumMember(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.EnumMember,
        symbol,
        exportSymbol
    );

    reflection.defaultValue = JSON.stringify(
        context.checker.getConstantValue(
            symbol.getDeclarations()![0] as ts.EnumMember
        )
    );

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);
}

function convertNamespace(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    let exportFlags = ts.SymbolFlags.ModuleMember;

    // This can happen in JS land where "class" functions get tagged as a namespace too
    if (
        symbol
            .getDeclarations()
            ?.some((d) => ts.isModuleDeclaration(d) || ts.isSourceFile(d)) !==
        true
    ) {
        exportFlags = ts.SymbolFlags.ClassMember;

        if (hasAnyFlag(symbol.flags, ts.SymbolFlags.Class)) {
            return;
        }
    }

    const reflection = context.createDeclarationReflection(
        ReflectionKind.Namespace,
        symbol,
        exportSymbol
    );
    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    convertSymbols(
        context.withScope(reflection),
        context.checker
            .getExportsOfModule(symbol)
            .filter((s) => s.flags & exportFlags)
    );
}

function convertTypeAlias(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const declaration = symbol
        ?.getDeclarations()
        ?.find(
            (
                d
            ): d is
                | ts.TypeAliasDeclaration
                | ts.JSDocTypedefTag
                | ts.JSDocCallbackTag
                | ts.JSDocEnumTag =>
                ts.isTypeAliasDeclaration(d) ||
                ts.isJSDocTypedefTag(d) ||
                ts.isJSDocCallbackTag(d) ||
                ts.isJSDocEnumTag(d)
        );
    assert(declaration);

    if (ts.isTypeAliasDeclaration(declaration)) {
        const reflection = context.createDeclarationReflection(
            ReflectionKind.TypeAlias,
            symbol,
            exportSymbol
        );

        reflection.type = context.converter.convertType(
            context.withScope(reflection),
            declaration.type
        );

        context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

        // Do this after finalization so that the CommentPlugin can get @typeParam tags
        // from the parent comment. Ugly, but works for now. Should be cleaned up with TSDoc
        // support.
        reflection.typeParameters = declaration.typeParameters?.map((param) =>
            createTypeParamReflection(param, context.withScope(reflection))
        );
    } else if (
        ts.isJSDocTypedefTag(declaration) ||
        ts.isJSDocEnumTag(declaration)
    ) {
        convertJsDocAlias(context, symbol, declaration, exportSymbol);
    } else {
        convertJsDocCallback(context, symbol, declaration, exportSymbol);
    }
}

function createTypeParamReflection(
    param: ts.TypeParameterDeclaration,
    context: Context
) {
    const constraint = param.constraint
        ? context.converter.convertType(context, param.constraint)
        : void 0;
    const defaultType = param.default
        ? context.converter.convertType(context, param.default)
        : void 0;
    const paramRefl = new TypeParameterReflection(
        param.name.text,
        constraint,
        defaultType,
        context.scope
    );
    context.registerReflection(paramRefl, param.symbol);
    context.trigger(ConverterEvents.CREATE_TYPE_PARAMETER, paramRefl, param);
    return paramRefl;
}

function convertFunctionOrMethod(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    // Can't just check method flag because this might be called for properties as well
    // This will *NOT* be called for variables that look like functions, they need a special case.
    const isMethod = !!(
        symbol.flags &
        (ts.SymbolFlags.Property | ts.SymbolFlags.Method)
    );

    const declarations =
        symbol.getDeclarations()?.filter(ts.isFunctionLike) ?? [];

    // Don't do anything if we inherited this method and it is private.
    if (
        isMethod &&
        isInherited(context, symbol) &&
        declarations.length > 0 &&
        hasAllFlags(
            ts.getCombinedModifierFlags(declarations[0]),
            ts.ModifierFlags.Private
        )
    ) {
        return;
    }

    const parentSymbol = context.project.getSymbolFromReflection(context.scope);

    const locationDeclaration =
        parentSymbol
            ?.getDeclarations()
            ?.find(
                (d) => ts.isClassDeclaration(d) || ts.isInterfaceDeclaration(d)
            ) ??
        parentSymbol?.getDeclarations()?.[0]?.getSourceFile() ??
        symbol.getDeclarations()?.[0]?.getSourceFile();
    assert(locationDeclaration, "Missing declaration context");

    const type = context.checker.getTypeOfSymbolAtLocation(
        symbol,
        locationDeclaration
    );
    // Need to get the non nullable type because interface methods might be declared
    // with a question token. See GH1490.
    const signatures = type.getNonNullableType().getCallSignatures();

    const reflection = context.createDeclarationReflection(
        context.scope.kindOf(
            ReflectionKind.ClassOrInterface |
                ReflectionKind.VariableOrProperty |
                ReflectionKind.TypeLiteral
        )
            ? ReflectionKind.Method
            : ReflectionKind.Function,
        symbol,
        exportSymbol,
        void 0
    );

    if (symbol.declarations?.length && isMethod) {
        // All method signatures must have the same modifier flags.
        setModifiers(symbol, symbol.declarations[0], reflection);
    }
    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    const scope = context.withScope(reflection);
    reflection.signatures ??= [];

    // Can't use zip here. We might have less declarations than signatures
    // or less signatures than declarations.
    for (let i = 0; i < signatures.length; i++) {
        createSignature(
            scope,
            ReflectionKind.CallSignature,
            signatures[i],
            declarations[i]
        );
    }
}

// getDeclaredTypeOfSymbol gets the INSTANCE type
// getTypeOfSymbolAtLocation gets the STATIC type
function convertClassOrInterface(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.createDeclarationReflection(
        ts.SymbolFlags.Class & symbol.flags
            ? ReflectionKind.Class
            : ReflectionKind.Interface,
        symbol,
        exportSymbol,
        void 0
    );

    const classDeclaration = symbol
        .getDeclarations()
        ?.find((d) => ts.isClassDeclaration(d) || ts.isFunctionDeclaration(d));
    if (classDeclaration) setModifiers(symbol, classDeclaration, reflection);

    const reflectionContext = context.withScope(reflection);

    const instanceType = context.checker.getDeclaredTypeOfSymbol(symbol);
    assert(instanceType.isClassOrInterface());

    // We might do some inheritance - do this first so that it's set when converting properties
    const declarations =
        symbol
            .getDeclarations()
            ?.filter(
                (d): d is ts.InterfaceDeclaration | ts.ClassDeclaration =>
                    ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d)
            ) ?? [];

    const extendedTypes = getHeritageTypes(
        declarations,
        ts.SyntaxKind.ExtendsKeyword
    ).map((t) => context.converter.convertType(reflectionContext, t));
    if (extendedTypes.length) {
        reflection.extendedTypes = extendedTypes;
    }

    const implementedTypes = getHeritageTypes(
        declarations,
        ts.SyntaxKind.ImplementsKeyword
    ).map((t) => context.converter.convertType(reflectionContext, t));
    if (implementedTypes.length) {
        reflection.implementedTypes = implementedTypes;
    }

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    if (classDeclaration) {
        // Classes can have static props
        const staticType = context.checker.getTypeOfSymbolAtLocation(
            symbol,
            classDeclaration
        );

        reflectionContext.shouldBeStatic = true;
        for (const prop of context.checker.getPropertiesOfType(staticType)) {
            // Don't convert namespace members, or the prototype here.
            if (
                prop.flags &
                (ts.SymbolFlags.ModuleMember | ts.SymbolFlags.Prototype)
            )
                continue;
            convertSymbol(reflectionContext, prop);
        }
        reflectionContext.shouldBeStatic = false;

        const constructMember = new DeclarationReflection(
            "constructor",
            ReflectionKind.Constructor,
            reflection
        );
        reflectionContext.addChild(constructMember);

        const ctors = staticType.getConstructSignatures();
        context.registerReflection(
            constructMember,
            ctors?.[0]?.declaration?.symbol
        );

        // Modifiers are the same for all constructors
        if (ctors.length && ctors[0].declaration) {
            setModifiers(symbol, ctors[0].declaration, constructMember);
        }

        context.trigger(
            ConverterEvents.CREATE_DECLARATION,
            constructMember,
            ts.isClassDeclaration(classDeclaration)
                ? classDeclaration.members.find(ts.isConstructorDeclaration)
                : void 0
        );

        const constructContext = reflectionContext.withScope(constructMember);

        ctors.forEach((sig) => {
            createSignature(
                constructContext,
                ReflectionKind.ConstructorSignature,
                sig
            );
        });
    }

    // Classes/interfaces usually just have properties...
    convertSymbols(
        reflectionContext,
        context.checker.getPropertiesOfType(instanceType)
    );

    // And type arguments
    if (instanceType.typeParameters) {
        reflection.typeParameters = instanceType.typeParameters.map((param) => {
            const declaration = param.symbol?.declarations?.[0];
            assert(declaration && ts.isTypeParameterDeclaration(declaration));
            return createTypeParamReflection(declaration, reflectionContext);
        });
    }

    // Interfaces might also have call signatures
    // Classes might too, because of declaration merging
    context.checker
        .getSignaturesOfType(instanceType, ts.SignatureKind.Call)
        .forEach((sig) =>
            createSignature(
                reflectionContext,
                ReflectionKind.CallSignature,
                sig
            )
        );

    // We also might have constructor signatures
    // This is potentially a problem with classes having multiple "constructor" members...
    // but nobody has complained yet.
    convertConstructSignatures(reflectionContext, symbol);

    // And finally, index signatures
    convertIndexSignature(reflectionContext, symbol);
}

function convertProperty(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const declarations = symbol.getDeclarations() ?? [];

    // Don't do anything if we inherited this property and it is private.
    if (
        isInherited(context, symbol) &&
        declarations.length > 0 &&
        hasAllFlags(
            ts.getCombinedModifierFlags(declarations[0]),
            ts.ModifierFlags.Private
        )
    ) {
        return;
    }

    // Special case: We pretend properties are methods if they look like methods.
    // This happens with mixins / weird inheritance.
    if (
        declarations.length &&
        declarations.every(
            (decl) => ts.isMethodSignature(decl) || ts.isMethodDeclaration(decl)
        )
    ) {
        return convertFunctionOrMethod(context, symbol, exportSymbol);
    }

    if (declarations.length === 1) {
        const declaration = declarations[0];

        // Special case: "arrow methods" should be treated as methods.
        if (
            ts.isPropertyDeclaration(declaration) &&
            !declaration.type &&
            declaration.initializer &&
            ts.isArrowFunction(declaration.initializer)
        ) {
            return convertArrowAsMethod(
                context,
                symbol,
                declaration.initializer,
                exportSymbol
            );
        }

        // Special case: "arrow properties" in type space should be treated as methods.
        if (
            ts.isPropertySignature(declaration) &&
            declaration.type &&
            ts.isFunctionTypeNode(declaration.type)
        ) {
            return convertArrowAsMethod(
                context,
                symbol,
                declaration.type,
                exportSymbol
            );
        }
    }

    const reflection = context.createDeclarationReflection(
        context.scope.kindOf(ReflectionKind.Namespace)
            ? ReflectionKind.Variable
            : ReflectionKind.Property,
        symbol,
        exportSymbol
    );

    const declaration = symbol.getDeclarations()?.[0];
    let parameterType: ts.TypeNode | undefined;

    if (
        declaration &&
        (ts.isPropertyDeclaration(declaration) ||
            ts.isPropertySignature(declaration) ||
            ts.isParameter(declaration) ||
            ts.isPropertyAccessExpression(declaration))
    ) {
        if (!ts.isPropertyAccessExpression(declaration)) {
            parameterType = declaration.type;
        }
        setModifiers(symbol, declaration, reflection);
    }
    reflection.defaultValue = declaration && convertDefaultValue(declaration);

    // FIXME: This is a horrible hack because getTypeOfSymbol is not exposed.
    // The right solution here is probably to keep track of parent nodes...
    // but that's tricky because not every reflection is guaranteed to have a
    // parent node. This will probably break in a future TS version.
    reflection.type = context.converter.convertType(
        context,
        (context.isConvertingTypeNode() ? parameterType : void 0) ??
            context.checker.getTypeOfSymbolAtLocation(symbol, {
                kind: ts.SyntaxKind.SourceFile,
            } as any)
    );

    if (reflection.flags.isOptional) {
        reflection.type = removeUndefined(reflection.type);
    }

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);
}

function convertArrowAsMethod(
    context: Context,
    symbol: ts.Symbol,
    arrow: ts.ArrowFunction | ts.FunctionTypeNode,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Method,
        symbol,
        exportSymbol,
        void 0
    );
    setModifiers(symbol, arrow.parent as ts.PropertyDeclaration, reflection);
    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    const rc = context.withScope(reflection);

    const signature = context.checker.getSignatureFromDeclaration(arrow);
    assert(signature);

    createSignature(rc, ReflectionKind.CallSignature, signature, arrow);
}

function convertConstructor(context: Context, symbol: ts.Symbol) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Constructor,
        symbol,
        void 0,
        "constructor"
    );
    context.finalizeDeclarationReflection(reflection, symbol);

    const reflectionContext = context.withScope(reflection);

    const declarations =
        symbol.getDeclarations()?.filter(ts.isConstructorDeclaration) ?? [];
    const signatures = declarations.map((decl) => {
        const sig = context.checker.getSignatureFromDeclaration(decl);
        assert(sig);
        return sig;
    });

    for (const sig of signatures) {
        createSignature(
            reflectionContext,
            ReflectionKind.ConstructorSignature,
            sig
        );
    }
}

function convertConstructSignatures(context: Context, symbol: ts.Symbol) {
    const type = context.checker.getDeclaredTypeOfSymbol(symbol);

    // These get added as a "constructor" member of this interface. This is a problem... but nobody
    // has complained yet. We really ought to have a constructSignatures property on the reflection instead.
    const constructSignatures = context.checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Construct
    );
    if (constructSignatures.length) {
        const constructMember = new DeclarationReflection(
            "constructor",
            ReflectionKind.Constructor,
            context.scope
        );
        context.addChild(constructMember);
        context.registerReflection(constructMember, undefined);

        context.trigger(
            ConverterEvents.CREATE_DECLARATION,
            constructMember,
            // FIXME this isn't good enough.
            context.converter.getNodesForSymbol(
                symbol,
                ReflectionKind.Constructor
            )[0]
        );

        const constructContext = context.withScope(constructMember);

        constructSignatures.forEach((sig) =>
            createSignature(
                constructContext,
                ReflectionKind.ConstructorSignature,
                sig
            )
        );
    }
}

function convertAlias(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.project.getReflectionFromSymbol(
        context.resolveAliasedSymbol(symbol)
    );
    if (!reflection) {
        // We don't have this, convert it.
        convertSymbol(
            context,
            context.resolveAliasedSymbol(symbol),
            exportSymbol ?? symbol
        );
    } else {
        createAlias(reflection, context, symbol, exportSymbol);
    }
}

function createAlias(
    target: Reflection,
    context: Context,
    symbol: ts.Symbol,
    exportSymbol: ts.Symbol | undefined
) {
    // We already have this. Create a reference.
    const ref = new ReferenceReflection(
        exportSymbol?.name ?? symbol.name,
        target,
        context.scope
    );
    context.addChild(ref);
    context.registerReflection(ref, symbol);

    context.trigger(
        ConverterEvents.CREATE_DECLARATION,
        ref,
        // FIXME this isn't good enough.
        context.converter.getNodesForSymbol(symbol, ReflectionKind.Reference)[0]
    );
}

function convertVariable(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const declaration = symbol.getDeclarations()?.[0];
    assert(declaration);

    const type = context.checker.getTypeOfSymbolAtLocation(symbol, declaration);

    if (
        isEnumLike(context.checker, type, declaration) &&
        symbol.getJsDocTags().some((tag) => tag.name === "enum")
    ) {
        return convertVariableAsEnum(context, symbol, exportSymbol);
    }

    if (type.getCallSignatures().length && !type.getProperties().length) {
        return convertVariableAsFunction(context, symbol, exportSymbol);
    }

    const reflection = context.createDeclarationReflection(
        ReflectionKind.Variable,
        symbol,
        exportSymbol
    );

    let typeNode: ts.TypeNode | undefined;
    if (ts.isVariableDeclaration(declaration)) {
        // Otherwise we might have destructuring
        typeNode = declaration.type;
    }

    reflection.type = context.converter.convertType(
        context.withScope(reflection),
        typeNode ?? type
    );

    setModifiers(symbol, declaration, reflection);

    reflection.defaultValue = convertDefaultValue(declaration);

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);
}

function isEnumLike(checker: ts.TypeChecker, type: ts.Type, location: ts.Node) {
    if (!hasAllFlags(type.flags, ts.TypeFlags.Object)) {
        return false;
    }

    return type.getProperties().every((prop) => {
        const propType = checker.getTypeOfSymbolAtLocation(prop, location);
        return propType.isStringLiteral() || propType.isNumberLiteral();
    });
}

function convertVariableAsEnum(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Enum,
        symbol,
        exportSymbol
    );
    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);
    const rc = context.withScope(reflection);

    const declaration = symbol.declarations![0] as ts.VariableDeclaration;
    const type = context.checker.getTypeAtLocation(declaration);

    for (const prop of type.getProperties()) {
        const reflection = rc.createDeclarationReflection(
            ReflectionKind.EnumMember,
            prop,
            void 0
        );

        const propType = context.checker.getTypeOfSymbolAtLocation(
            prop,
            declaration
        );
        assert(propType.isStringLiteral() || propType.isNumberLiteral());

        reflection.defaultValue = JSON.stringify(propType.value);

        rc.finalizeDeclarationReflection(reflection, prop, void 0);
    }

    // Skip converting the type alias, if there is one
    return ts.SymbolFlags.TypeAlias;
}

function convertVariableAsFunction(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const declaration = symbol
        .getDeclarations()
        ?.find(ts.isVariableDeclaration);

    const accessDeclaration = declaration ?? symbol.valueDeclaration;

    const type = accessDeclaration
        ? context.checker.getTypeOfSymbolAtLocation(symbol, accessDeclaration)
        : context.checker.getDeclaredTypeOfSymbol(symbol);

    const reflection = context.createDeclarationReflection(
        ReflectionKind.Function,
        symbol,
        exportSymbol
    );
    setModifiers(symbol, accessDeclaration, reflection);

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    const reflectionContext = context.withScope(reflection);

    reflection.signatures ??= [];
    for (const signature of type.getCallSignatures()) {
        createSignature(
            reflectionContext,
            ReflectionKind.CallSignature,
            signature,
            void 0,
            declaration
        );
    }
}

function convertAccessor(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Accessor,
        symbol,
        exportSymbol
    );
    const rc = context.withScope(reflection);

    const declaration = symbol.getDeclarations()?.[0];
    if (declaration) {
        setModifiers(symbol, declaration, reflection);
    }

    context.finalizeDeclarationReflection(reflection, symbol, exportSymbol);

    const getDeclaration = symbol.getDeclarations()?.find(ts.isGetAccessor);
    if (getDeclaration) {
        const signature =
            context.checker.getSignatureFromDeclaration(getDeclaration);
        if (signature) {
            createSignature(
                rc,
                ReflectionKind.GetSignature,
                signature,
                getDeclaration
            );
        }
    }

    const setDeclaration = symbol.getDeclarations()?.find(ts.isSetAccessor);
    if (setDeclaration) {
        const signature =
            context.checker.getSignatureFromDeclaration(setDeclaration);
        if (signature) {
            createSignature(
                rc,
                ReflectionKind.SetSignature,
                signature,
                setDeclaration
            );
        }
    }
}

function isInherited(context: Context, symbol: ts.Symbol) {
    const parentSymbol = context.project.getSymbolFromReflection(context.scope);
    assert(
        parentSymbol,
        `No parent symbol found for ${symbol.name} in ${context.scope.name}`
    );
    return (
        parentSymbol
            .getDeclarations()
            ?.some((d) =>
                symbol.getDeclarations()?.some((d2) => d2.parent === d)
            ) === false
    );
}

function setModifiers(
    symbol: ts.Symbol,
    declaration: ts.Declaration | undefined,
    reflection: Reflection
) {
    if (!declaration) {
        return;
    }

    const modifiers = ts.getCombinedModifierFlags(declaration);

    if (
        ts.isMethodDeclaration(declaration) ||
        ts.isPropertyDeclaration(declaration) ||
        ts.isAccessor(declaration)
    ) {
        if (ts.isPrivateIdentifier(declaration.name)) {
            reflection.setFlag(ReflectionFlag.Private);
        }
    }
    if (hasAllFlags(modifiers, ts.ModifierFlags.Private)) {
        reflection.setFlag(ReflectionFlag.Private);
    }
    if (hasAllFlags(modifiers, ts.ModifierFlags.Protected)) {
        reflection.setFlag(ReflectionFlag.Protected);
    }
    if (hasAllFlags(modifiers, ts.ModifierFlags.Public)) {
        reflection.setFlag(ReflectionFlag.Public);
    }
    reflection.setFlag(
        ReflectionFlag.Optional,
        hasAllFlags(symbol.flags, ts.SymbolFlags.Optional)
    );
    reflection.setFlag(
        ReflectionFlag.Readonly,
        hasAllFlags(symbol.checkFlags ?? 0, ts.CheckFlags.Readonly) ||
            hasAllFlags(modifiers, ts.ModifierFlags.Readonly)
    );
    reflection.setFlag(
        ReflectionFlag.Abstract,
        hasAllFlags(modifiers, ts.ModifierFlags.Abstract)
    );

    if (
        reflection.kindOf(ReflectionKind.Variable) &&
        hasAllFlags(symbol.flags, ts.SymbolFlags.BlockScopedVariable)
    ) {
        reflection.setFlag(
            ReflectionFlag.Const,
            hasAllFlags(declaration.parent.flags, ts.NodeFlags.Const)
        );
    }

    // ReflectionFlag.Static happens when constructing the reflection.
    // We don't have sufficient information here to determine if it ought to be static.
}
