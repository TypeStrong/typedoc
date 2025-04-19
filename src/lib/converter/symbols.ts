import assert from "assert";
import ts from "typescript";
import {
    DeclarationReflection,
    IntrinsicType,
    LiteralType,
    ReferenceReflection,
    type Reflection,
    ReflectionFlag,
    ReflectionKind,
    type UnionType,
} from "../models/index.js";
import { getEnumFlags, hasAllFlags, hasAnyFlag, i18n, removeFlag } from "#utils";
import type { Context } from "./context.js";
import { convertDefaultValue } from "./convert-expression.js";
import { convertIndexSignatures } from "./factories/index-signature.js";
import {
    convertTypeParameters,
    createConstructSignatureWithType,
    createSignature,
    createTypeParamReflection,
} from "./factories/signature.js";
import { convertJsDocAlias, convertJsDocCallback } from "./jsdoc.js";
import { getHeritageTypes } from "./utils/nodes.js";
import { removeUndefined } from "./utils/reflections.js";
import { resolveAliasedSymbol } from "./utils/symbols.js";

const symbolConverters: {
    [K in ts.SymbolFlags]?: (
        context: Context,
        symbol: ts.Symbol,
        exportSymbol?: ts.Symbol,
    ) => undefined | ts.SymbolFlags;
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
    [ts.SymbolFlags.ExportValue]: convertVariable,
    [ts.SymbolFlags.GetAccessor]: convertAccessor,
    [ts.SymbolFlags.SetAccessor]: convertAccessor,
};

const allConverterFlags = Object.keys(symbolConverters).reduce(
    (v, k) => v | +k,
    0,
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
    ts.SymbolFlags.ExportValue,
    ts.SymbolFlags.Function, // Before NamespaceModule

    ts.SymbolFlags.TypeAlias,
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
    assert(
        Number.isInteger(Math.log2(+key)),
        `Symbol converter for key ${ts.SymbolFlags[+key]} does not specify a valid flag value.`,
    );

    assert(
        conversionOrder.includes(+key),
        `Symbol converter for key ${ts.SymbolFlags[+key]} is not specified in conversionOrder`,
    );
}

assert(
    conversionOrder.reduce((a, b) => a | b, 0) === allConverterFlags,
    "conversionOrder contains a symbol flag that converters do not.",
);

function _convertSymbolNow(context: Context, symbol: ts.Symbol, exportSymbol: ts.Symbol | undefined) {
    if (context.shouldIgnore(resolveAliasedSymbol(symbol, context.checker))) {
        return;
    }

    // This check can catch symbols which ought to be documented as references
    // but aren't aliased symbols because `export *` was used.
    const previous = context.getReflectionFromSymbol(symbol);
    if (
        previous &&
        previous.parent?.kindOf(
            ReflectionKind.SomeModule | ReflectionKind.Project,
        )
    ) {
        createAlias(previous, context, symbol, exportSymbol);
        return;
    }

    let flags = removeFlag(
        symbol.flags,
        ts.SymbolFlags.Transient |
            ts.SymbolFlags.Assignment |
            ts.SymbolFlags.Optional |
            ts.SymbolFlags.Prototype,
    );

    // Declaration merging - the only type (excluding enum/enum, ns/ns, etc)
    // that TD supports is merging a class and interface. All others are
    // represented as multiple reflections
    if (hasAllFlags(symbol.flags, ts.SymbolFlags.Class)) {
        flags = removeFlag(
            flags,
            ts.SymbolFlags.Interface | ts.SymbolFlags.Function,
        );
    }

    // Kind of declaration merging... we treat this as a property with get/set signatures.
    if (hasAllFlags(symbol.flags, ts.SymbolFlags.GetAccessor)) {
        flags = removeFlag(flags, ts.SymbolFlags.SetAccessor);
    }

    if (hasAllFlags(symbol.flags, ts.SymbolFlags.NamespaceModule)) {
        // This might be here if a namespace is declared several times.
        // Or if it's a namespace-like thing defined on a function
        // In the function case, it's important to remove ValueModule so that
        // if we convert the children as properties of the function rather than as
        // a separate namespace, we skip creating the namespace.
        flags = removeFlag(flags, ts.SymbolFlags.ValueModule);
    }

    if (
        hasAnyFlag(
            symbol.flags,
            ts.SymbolFlags.Method |
                ts.SymbolFlags.Interface |
                ts.SymbolFlags.Class |
                ts.SymbolFlags.Variable,
        )
    ) {
        // This happens when someone declares an object with methods:
        // { methodProperty() {} }
        flags = removeFlag(flags, ts.SymbolFlags.Property);
    }

    for (const flag of getEnumFlags(flags & ~allConverterFlags)) {
        context.logger.verbose(
            `Missing converter for symbol: ${symbol.name} with flag ${ts.SymbolFlags[flag]}`,
        );
    }

    const selectedConverters = conversionOrder.filter(flag => flag & flags);

    let skip = 0;
    for (const flag of selectedConverters) {
        if (skip & flag) continue;

        skip |= symbolConverters[flag]?.(context, symbol, exportSymbol) || 0;
    }
}

export function convertSymbol(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): void {
    // #1795, defer conversion of symbols named `default` so that if a function
    // is default exported and also exported with a name, the name takes precedence
    if (
        (exportSymbol?.name ?? symbol.name) === "default" &&
        context.scope.kindOf(ReflectionKind.ExportContainer)
    ) {
        context.converter.deferConversion(() => {
            _convertSymbolNow(context, symbol, exportSymbol);
        });
        return;
    }

    _convertSymbolNow(context, symbol, exportSymbol);
}

function convertSymbols(context: Context, symbols: readonly ts.Symbol[]) {
    for (const symbol of symbols) {
        convertSymbol(context, symbol);
    }
}

function convertEnum(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Enum,
        symbol,
        exportSymbol,
    );

    if (symbol.flags & ts.SymbolFlags.ConstEnum) {
        reflection.setFlag(ReflectionFlag.Const);
    }

    context.finalizeDeclarationReflection(reflection);

    convertSymbols(
        context.withScope(reflection),
        context.checker
            .getExportsOfModule(symbol)
            .filter((s) => s.flags & ts.SymbolFlags.EnumMember),
    );
}

function convertEnumMember(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.EnumMember,
        symbol,
        exportSymbol,
    );

    const defaultValue = context.checker.getConstantValue(
        symbol.getDeclarations()![0] as ts.EnumMember,
    );

    if (defaultValue !== undefined) {
        reflection.type = new LiteralType(defaultValue);
    } else {
        // We know this has to be a number, because computed values aren't allowed
        // in string enums, so otherwise we would have to have the constant value
        reflection.type = new IntrinsicType("number");
    }

    context.finalizeDeclarationReflection(reflection);
}

function convertNamespace(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined {
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

    if (symbol.declarations?.some(ts.isFunctionDeclaration)) {
        exportFlags |= ts.SymbolFlags.PropertyOrAccessor;
    }

    // #2364, @namespace on a variable might be merged with a namespace containing types.
    const existingReflection = context.getReflectionFromSymbol(
        exportSymbol || symbol,
    );

    let reflection: DeclarationReflection;
    if (existingReflection?.kind === ReflectionKind.Namespace) {
        reflection = existingReflection as DeclarationReflection;
    } else {
        let kind = ReflectionKind.Namespace;
        let nameOverride: string | undefined;

        // #2778 - always treat declare module "foo" as a module, not a namespace
        const declareModule = symbol.declarations?.find(
            (mod): mod is ts.ModuleDeclaration => ts.isModuleDeclaration(mod) && ts.isStringLiteral(mod.name),
        );
        if (declareModule) {
            kind = ReflectionKind.Module;
            nameOverride = declareModule.name.text;
        }

        reflection = context.createDeclarationReflection(
            kind,
            symbol,
            exportSymbol,
            nameOverride,
        );
        context.finalizeDeclarationReflection(reflection);
    }

    convertSymbols(
        context.withScope(reflection),
        context.checker
            .getExportsOfModule(symbol)
            .filter((s) => s.flags & exportFlags),
    );
}

function convertTypeAlias(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined {
    const declaration = symbol
        .getDeclarations()
        ?.find(
            (
                d,
            ): d is
                | ts.TypeAliasDeclaration
                | ts.JSDocTypedefTag
                | ts.JSDocCallbackTag
                | ts.JSDocEnumTag =>
                ts.isTypeAliasDeclaration(d) ||
                ts.isJSDocTypedefTag(d) ||
                ts.isJSDocCallbackTag(d) ||
                ts.isJSDocEnumTag(d),
        );
    assert(declaration);

    if (ts.isTypeAliasDeclaration(declaration)) {
        if (
            context
                .getComment(symbol, ReflectionKind.TypeAlias)
                ?.hasModifier("@interface")
        ) {
            return convertTypeAliasAsInterface(
                context,
                symbol,
                exportSymbol,
                declaration,
            );
        }

        const reflection = context.createDeclarationReflection(
            ReflectionKind.TypeAlias,
            symbol,
            exportSymbol,
        );
        context.finalizeDeclarationReflection(reflection);

        if (reflection.comment?.hasModifier("@useDeclaredType")) {
            reflection.comment.removeModifier("@useDeclaredType");
            reflection.type = context.converter.convertType(
                context.withScope(reflection),
                context.checker.getDeclaredTypeOfSymbol(symbol),
            );
        } else {
            reflection.type = context.converter.convertType(
                context.withScope(reflection),
                declaration.type,
            );
        }

        if (reflection.type.type === "union") {
            attachUnionComments(context, declaration, reflection.type);
        } else if (reflection.type.type === "reflection" && reflection.type.declaration.children) {
            // #2817 lift properties of object literal types up to the reflection level.
            const typeDecl = reflection.type.declaration;
            reflection.project.mergeReflections(typeDecl, reflection);
            delete reflection.type;

            // When created any signatures will be created with __type as their
            // name, rename them so that they have the alias's name as their name
            for (const sig of reflection.signatures || []) {
                sig.name = reflection.name;
            }
        }

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

function attachUnionComments(
    context: Context,
    declaration: ts.TypeAliasDeclaration,
    union: UnionType,
) {
    const list = declaration.type.getChildAt(0);
    if (list.kind !== ts.SyntaxKind.SyntaxList) return;

    let unionIndex = 0;
    for (const child of list.getChildren()) {
        const comment = context.getNodeComment(child, false);
        if (comment?.modifierTags.size || comment?.blockTags.length) {
            context.logger.warn(
                i18n.comment_for_0_should_not_contain_block_or_modifier_tags(
                    `${context.scope.getFriendlyFullName()}.${unionIndex}`,
                ),
                child,
            );
        }

        if (comment) {
            union.elementSummaries ||= Array.from(
                { length: union.types.length },
                () => [],
            );
            union.elementSummaries[unionIndex] = comment.summary;
        }

        if (child.kind !== ts.SyntaxKind.BarToken) {
            ++unionIndex;
        }
    }
}

function convertTypeAliasAsInterface(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol: ts.Symbol | undefined,
    declaration: ts.TypeAliasDeclaration,
): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Interface,
        symbol,
        exportSymbol,
    );
    context.finalizeDeclarationReflection(reflection);
    const rc = context.withScope(reflection);

    const type = context.checker.getTypeAtLocation(declaration);

    if (type.getFlags() & ts.TypeFlags.Union) {
        context.logger.warn(
            i18n.converting_union_as_interface(),
            declaration,
        );
    }

    // Interfaces have properties
    convertSymbols(rc, type.getProperties());

    // And type arguments
    if (declaration.typeParameters) {
        reflection.typeParameters = declaration.typeParameters.map((param) => {
            const declaration = param.symbol?.declarations?.[0];
            assert(declaration && ts.isTypeParameterDeclaration(declaration));
            return createTypeParamReflection(declaration, rc);
        });
    }

    // And maybe call signatures
    context.checker
        .getSignaturesOfType(type, ts.SignatureKind.Call)
        .forEach((sig) => createSignature(rc, ReflectionKind.CallSignature, sig, symbol));

    // And maybe constructor signatures
    convertConstructSignatures(rc, symbol);

    // And finally, index signatures
    convertIndexSignatures(rc, type);
}

function convertFunctionOrMethod(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined | ts.SymbolFlags {
    // Can't just check method flag because this might be called for properties as well
    // This will *NOT* be called for variables that look like functions, they need a special case.
    const isMethod = !!(
        symbol.flags &
        (ts.SymbolFlags.Property | ts.SymbolFlags.Method)
    );

    if (!isMethod) {
        const comment = context.getComment(symbol, ReflectionKind.Function);
        if (comment?.hasModifier("@class")) {
            return convertSymbolAsClass(context, symbol, exportSymbol);
        }
    }

    const declarations = symbol.getDeclarations()?.filter(ts.isFunctionLike) ?? [];

    // Don't do anything if we inherited this method and it is private.
    if (
        isMethod &&
        isInherited(context, symbol) &&
        declarations.length > 0 &&
        hasAllFlags(
            ts.getCombinedModifierFlags(declarations[0]),
            ts.ModifierFlags.Private,
        )
    ) {
        return;
    }

    const locationDeclaration = symbol.parent
        ?.getDeclarations()
        ?.find(
            (d) => ts.isClassDeclaration(d) || ts.isInterfaceDeclaration(d),
        ) ??
        symbol.parent?.getDeclarations()?.[0]?.getSourceFile() ??
        symbol.getDeclarations()?.[0]?.getSourceFile();
    assert(locationDeclaration, "Missing declaration context");

    const type = context.checker.getTypeOfSymbolAtLocation(
        symbol,
        locationDeclaration,
    );
    // Need to get the non nullable type because interface methods might be declared
    // with a question token. See GH1490.
    const signatures = type.getNonNullableType().getCallSignatures();

    const reflection = context.createDeclarationReflection(
        context.scope.kindOf(ReflectionKind.MethodContainer)
            ? ReflectionKind.Method
            : ReflectionKind.Function,
        symbol,
        exportSymbol,
        void 0,
    );

    if (symbol.declarations?.length && isMethod) {
        // All method signatures must have the same modifier flags.
        setModifiers(symbol, symbol.declarations[0], reflection);
    }
    context.finalizeDeclarationReflection(reflection);

    const scope = context.withScope(reflection);

    for (const sig of signatures) {
        createSignature(scope, ReflectionKind.CallSignature, sig, symbol);
    }

    return convertFunctionProperties(scope, symbol, type);
}

// getDeclaredTypeOfSymbol gets the INSTANCE type
// getTypeOfSymbolAtLocation gets the STATIC type
function convertClassOrInterface(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
) {
    const reflection = context.createDeclarationReflection(
        ts.SymbolFlags.Class & symbol.flags
            ? ReflectionKind.Class
            : ReflectionKind.Interface,
        symbol,
        exportSymbol,
        void 0,
    );

    const classDeclaration = symbol
        .getDeclarations()
        ?.find((d) => ts.isClassDeclaration(d) || ts.isFunctionDeclaration(d));
    if (classDeclaration) setModifiers(symbol, classDeclaration, reflection);

    const reflectionContext = context.withScope(reflection);
    reflectionContext.convertingClassOrInterface = true;

    const instanceType = context.checker.getDeclaredTypeOfSymbol(symbol);
    assert(instanceType.isClassOrInterface());

    // We might do some inheritance - do this first so that it's set when converting properties
    const declarations = symbol
        .getDeclarations()
        ?.filter(
            (d): d is ts.InterfaceDeclaration | ts.ClassDeclaration =>
                ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d),
        ) ?? [];

    const extendedTypes = getHeritageTypes(
        declarations,
        ts.SyntaxKind.ExtendsKeyword,
    ).map((t) => context.converter.convertType(reflectionContext, t));
    if (extendedTypes.length) {
        reflection.extendedTypes = extendedTypes;
    }

    const implementedTypes = getHeritageTypes(
        declarations,
        ts.SyntaxKind.ImplementsKeyword,
    ).map((t) => context.converter.convertType(reflectionContext, t));
    if (implementedTypes.length) {
        reflection.implementedTypes = implementedTypes;
    }

    context.finalizeDeclarationReflection(reflection);

    if (classDeclaration) {
        // Classes can have static props
        const staticType = context.checker.getTypeOfSymbolAtLocation(
            symbol,
            classDeclaration,
        );

        reflectionContext.shouldBeStatic = true;
        for (const prop of context.checker.getPropertiesOfType(staticType)) {
            // Don't convert namespace members, or the prototype here.
            if (
                prop.flags &
                (ts.SymbolFlags.ModuleMember | ts.SymbolFlags.Prototype)
            ) {
                continue;
            }
            convertSymbol(reflectionContext, prop);
        }
        reflectionContext.shouldBeStatic = false;

        const ctors = staticType.getConstructSignatures();

        const constructMember = reflectionContext.createDeclarationReflection(
            ReflectionKind.Constructor,
            ctors[0]?.declaration?.symbol,
            void 0,
            "constructor",
        );

        // Modifiers are the same for all constructors
        if (ctors.length && ctors[0].declaration) {
            setModifiers(symbol, ctors[0].declaration, constructMember);
        }

        context.finalizeDeclarationReflection(constructMember);

        const constructContext = reflectionContext.withScope(constructMember);

        ctors.forEach((sig) => {
            createSignature(
                constructContext,
                ReflectionKind.ConstructorSignature,
                sig,
                symbol,
            );
        });
    }

    // Classes/interfaces usually just have properties...
    convertSymbols(
        reflectionContext,
        context.checker.getPropertiesOfType(instanceType),
    );

    // And type arguments
    if (instanceType.typeParameters) {
        reflection.typeParameters = instanceType.typeParameters.map((param) => {
            const declaration = param.symbol.declarations?.[0];
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
                sig,
                symbol,
            )
        );

    // We also might have constructor signatures
    // This is potentially a problem with classes having multiple "constructor" members...
    // but nobody has complained yet.
    convertConstructSignatures(reflectionContext, symbol);

    // And finally, index signatures
    convertIndexSignatures(reflectionContext, instanceType);

    // Normally this shouldn't matter, unless someone did something with skipLibCheck on.
    return ts.SymbolFlags.Alias;
}

function convertProperty(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined | ts.SymbolFlags {
    // This might happen if we're converting a function-module created with Object.assign
    // or `export default () => {}`
    if (context.scope.kindOf(ReflectionKind.VariableContainer)) {
        return convertVariable(context, symbol, exportSymbol);
    }

    const declarations = symbol.getDeclarations() ?? [];

    // Don't do anything if we inherited this property and it is private.
    if (
        isInherited(context, symbol) &&
        declarations.length > 0 &&
        hasAllFlags(
            ts.getCombinedModifierFlags(declarations[0]),
            ts.ModifierFlags.Private,
        )
    ) {
        return;
    }

    // Special case: We pretend properties are methods if they look like methods.
    // This happens with mixins / weird inheritance. Don't do this if the type
    // doesn't have call signatures to avoid converting non-functions. This can
    // happen if @class is used and functions are converted to their return type
    // with a mapped type (e.g. with Vue's `computed` properties)
    const type = context.checker.getTypeOfSymbol(symbol);
    if (
        type.getCallSignatures().length &&
        declarations.length &&
        declarations.every(
            (decl) => ts.isMethodSignature(decl) || ts.isMethodDeclaration(decl),
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
                exportSymbol,
            );
        }
    }

    const reflection = context.createDeclarationReflection(
        context.scope.kindOf(ReflectionKind.VariableContainer)
            ? ReflectionKind.Variable
            : ReflectionKind.Property,
        symbol,
        exportSymbol,
    );

    const declaration = symbol.getDeclarations()?.[0];
    let parameterTypeNode: ts.TypeNode | undefined;

    if (
        declaration &&
        (ts.isPropertyDeclaration(declaration) ||
            ts.isPropertySignature(declaration) ||
            ts.isParameter(declaration) ||
            ts.isPropertyAccessExpression(declaration) ||
            ts.isPropertyAssignment(declaration))
    ) {
        if (
            !ts.isPropertyAccessExpression(declaration) &&
            !ts.isPropertyAssignment(declaration)
        ) {
            parameterTypeNode = declaration.type;
        }
        setModifiers(symbol, declaration, reflection);
    } else {
        setSymbolModifiers(symbol, reflection);
    }
    reflection.defaultValue = declaration && convertDefaultValue(declaration);

    if (context.convertingTypeNode && parameterTypeNode) {
        reflection.type = context.converter.convertType(
            context.withScope(reflection),
            parameterTypeNode,
        );
    } else {
        reflection.type = context.converter.convertType(
            context.withScope(reflection),
            context.checker.getTypeOfSymbol(symbol),
            parameterTypeNode,
        );
    }

    if (reflection.flags.isOptional) {
        reflection.type = removeUndefined(reflection.type);
    }

    context.finalizeDeclarationReflection(reflection);
}

function convertArrowAsMethod(
    context: Context,
    symbol: ts.Symbol,
    arrow: ts.ArrowFunction,
    exportSymbol?: ts.Symbol,
): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Method,
        symbol,
        exportSymbol,
        void 0,
    );
    setModifiers(symbol, arrow.parent as ts.PropertyDeclaration, reflection);
    context.finalizeDeclarationReflection(reflection);

    const rc = context.withScope(reflection);

    const locationDeclaration = symbol.parent
        ?.getDeclarations()
        ?.find(
            (d) => ts.isClassDeclaration(d) || ts.isInterfaceDeclaration(d),
        ) ??
        symbol.parent?.getDeclarations()?.[0]?.getSourceFile() ??
        symbol.getDeclarations()?.[0]?.getSourceFile();
    assert(locationDeclaration, "Missing declaration context");

    const type = context.checker.getTypeOfSymbolAtLocation(
        symbol,
        locationDeclaration,
    );

    const signatures = type.getNonNullableType().getCallSignatures();
    assert(signatures.length, "Missing signatures");

    createSignature(
        rc,
        ReflectionKind.CallSignature,
        signatures[0],
        symbol,
        arrow,
    );
}

function convertConstructor(context: Context, symbol: ts.Symbol): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Constructor,
        symbol,
        void 0,
        "constructor",
    );
    context.finalizeDeclarationReflection(reflection);

    const reflectionContext = context.withScope(reflection);

    const declarations = symbol.getDeclarations()?.filter(ts.isConstructorDeclaration) ?? [];
    const signatures = declarations.map((decl) => {
        const sig = context.checker.getSignatureFromDeclaration(decl);
        assert(sig);
        return sig;
    });

    for (const sig of signatures) {
        createSignature(
            reflectionContext,
            ReflectionKind.ConstructorSignature,
            sig,
            symbol,
        );
    }
}

function convertConstructSignatures(context: Context, symbol: ts.Symbol) {
    const type = context.checker.getDeclaredTypeOfSymbol(symbol);

    // These get added as a "constructor" member of this interface. This is a problem... but nobody
    // has complained yet. We really ought to have a constructSignatures property on the reflection instead.
    const constructSignatures = context.checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Construct,
    );
    if (constructSignatures.length) {
        const constructMember = new DeclarationReflection(
            "constructor",
            ReflectionKind.Constructor,
            context.scope,
        );
        context.postReflectionCreation(constructMember, symbol, void 0);
        context.finalizeDeclarationReflection(constructMember);

        const constructContext = context.withScope(constructMember);

        constructSignatures.forEach((sig) =>
            createSignature(
                constructContext,
                ReflectionKind.ConstructorSignature,
                sig,
                symbol,
            )
        );
    }
}

function convertAlias(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined {
    // If this is a namespace marked as a primary export or directly within one
    // marked as a primary export then we should convert it immediately rather than deferring
    if (
        context.scope.comment?.hasModifier("@primaryExport") ||
        context.getComment(exportSymbol || symbol, ReflectionKind.Namespace)?.hasModifier("@primaryExport")
    ) {
        _convertAlias();
    } else {
        // Defer conversion of aliases so that if the original module/namespace
        // containing them is included in the docs, we will point to that namespace
        // rather than pointing that namespace to the first namespace encountered, #2856.
        context.converter.deferConversion(_convertAlias);
    }

    function _convertAlias() {
        const reflection = context.getReflectionFromSymbol(
            context.resolveAliasedSymbol(symbol),
        );
        if (
            !reflection ||
            (reflection &&
                !reflection.parent?.kindOf(
                    ReflectionKind.Project | ReflectionKind.SomeModule,
                ))
        ) {
            // We don't have this, convert it.
            convertSymbol(
                context,
                context.resolveAliasedSymbol(symbol),
                exportSymbol ?? symbol,
            );
        } else {
            createAlias(reflection, context, symbol, exportSymbol);
        }
    }
}

function createAlias(
    target: Reflection,
    context: Context,
    symbol: ts.Symbol,
    exportSymbol: ts.Symbol | undefined,
) {
    if (context.converter.excludeReferences) return;

    // We already have this. Create a reference.
    const ref = new ReferenceReflection(
        exportSymbol?.name ?? symbol.name,
        target.isReference() ? target.getTargetReflection() : target,
        context.scope,
    );
    context.postReflectionCreation(ref, symbol, exportSymbol);
    context.finalizeDeclarationReflection(ref);
}

function convertVariable(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined | ts.SymbolFlags {
    const declaration = symbol.getDeclarations()?.[0];

    const comment = context.getComment(symbol, ReflectionKind.Variable);
    const type = declaration
        ? context.checker.getTypeOfSymbolAtLocation(symbol, declaration)
        : context.checker.getTypeOfSymbol(symbol);

    if (
        isEnumLike(context.checker, type, declaration) &&
        comment?.hasModifier("@enum")
    ) {
        return convertVariableAsEnum(context, symbol, exportSymbol);
    }

    if (comment?.hasModifier("@namespace")) {
        return convertVariableAsNamespace(context, symbol, exportSymbol);
    }

    if (comment?.hasModifier("@class")) {
        return convertSymbolAsClass(context, symbol, exportSymbol);
    }

    if (
        type.getCallSignatures().length &&
        !type.getConstructSignatures().length
    ) {
        if (
            comment?.hasModifier("@function") ||
            (declaration && shouldAutomaticallyConvertAsFunction(declaration))
        ) {
            return convertVariableAsFunction(context, symbol, exportSymbol);
        }
    }

    const reflection = context.createDeclarationReflection(
        context.scope.kindOf(ReflectionKind.VariableContainer)
            ? ReflectionKind.Variable
            : ReflectionKind.Property,
        symbol,
        exportSymbol,
    );

    let typeNode: ts.TypeNode | undefined;
    if (declaration && ts.isVariableDeclaration(declaration)) {
        // Otherwise we might have destructuring
        typeNode = declaration.type;
    }

    if (typeNode) {
        reflection.type = context.converter.convertType(
            context.withScope(reflection),
            typeNode,
        );
    } else {
        reflection.type = context.converter.convertType(
            context.withScope(reflection),
            type,
            typeNode,
        );
    }

    setModifiers(symbol, declaration, reflection);

    reflection.defaultValue = convertDefaultValue(declaration);
    context.finalizeDeclarationReflection(reflection);

    // Exclude ValueModule to handle `module.exports = []`
    return ts.SymbolFlags.Property | ts.SymbolFlags.ValueModule;
}

function isEnumLike(
    checker: ts.TypeChecker,
    type: ts.Type,
    location?: ts.Node,
) {
    if (!location || !hasAllFlags(type.flags, ts.TypeFlags.Object)) {
        return false;
    }

    return type.getProperties().every((prop) => {
        const propType = checker.getTypeOfSymbolAtLocation(prop, location);
        return isValidEnumProperty(propType);
    });
}

function isValidEnumProperty(type: ts.Type) {
    return hasAnyFlag(
        type.flags,
        ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike,
    );
}

function convertVariableAsEnum(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined | ts.SymbolFlags {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Enum,
        symbol,
        exportSymbol,
    );
    context.finalizeDeclarationReflection(reflection);
    const rc = context.withScope(reflection);

    const declaration = symbol.declarations!.find(ts.isVariableDeclaration)!;
    const type = context.checker.getTypeAtLocation(declaration);

    for (const prop of type.getProperties()) {
        const reflection = rc.createDeclarationReflection(
            ReflectionKind.EnumMember,
            prop,
            void 0,
        );

        const propType = context.checker.getTypeOfSymbolAtLocation(
            prop,
            declaration,
        );

        reflection.type = context.converter.convertType(
            rc.withScope(reflection),
            propType,
        );

        rc.finalizeDeclarationReflection(reflection);
    }

    // Skip converting the type alias, if there is one
    return ts.SymbolFlags.TypeAlias;
}

function convertVariableAsNamespace(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Namespace,
        symbol,
        exportSymbol,
    );
    context.finalizeDeclarationReflection(reflection);
    const rc = context.withScope(reflection);

    const type = context.checker.getTypeOfSymbol(symbol);
    convertSymbols(rc, type.getProperties());

    return ts.SymbolFlags.Property;
}

function convertVariableAsFunction(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
) {
    const declaration = symbol
        .getDeclarations()
        ?.find(ts.isVariableDeclaration);

    const accessDeclaration = declaration ?? symbol.valueDeclaration;

    const type = accessDeclaration
        ? context.checker.getTypeOfSymbolAtLocation(symbol, accessDeclaration)
        : context.checker.getDeclaredTypeOfSymbol(symbol);

    const reflection = context.createDeclarationReflection(
        context.scope.kindOf(ReflectionKind.MethodContainer)
            ? ReflectionKind.Method
            : ReflectionKind.Function,
        symbol,
        exportSymbol,
    );
    setModifiers(symbol, accessDeclaration, reflection);
    context.finalizeDeclarationReflection(reflection);

    const reflectionContext = context.withScope(reflection);

    reflection.signatures ??= [];
    for (const signature of type.getCallSignatures()) {
        createSignature(
            reflectionContext,
            ReflectionKind.CallSignature,
            signature,
            symbol,
        );
    }

    reflection.comment?.removeModifier("@function");

    // #2824 If there is only one signature, and there isn't a comment
    // on the signature already, treat the comment on the variable
    // as if it belongs to the signature instead.
    if (
        reflection.signatures.length === 1 &&
        !reflection.signatures[0].comment &&
        reflection.comment
    ) {
        reflection.signatures[0].comment = reflection.comment;
        delete reflection.comment;
    }

    return (
        convertFunctionProperties(context.withScope(reflection), symbol, type) |
        ts.SymbolFlags.Property
    );
}

function convertFunctionProperties(
    context: Context,
    symbol: ts.Symbol,
    type: ts.Type,
) {
    // #2436/#2461: Functions created with Object.assign on a function likely have properties
    // that we should document. We also add properties to the function if they are defined like:
    //   function f() {}
    //   f.x = 123;
    // rather than creating a separate namespace.
    // In the expando case, we'll have both namespace flags.
    // In the Object.assign case, we'll have no namespace flags.
    const nsFlags = ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule;
    if (
        type.getProperties().length &&
        (hasAllFlags(symbol.flags, nsFlags) ||
            !hasAnyFlag(symbol.flags, nsFlags)) &&
        !symbol.declarations?.some(ts.isModuleDeclaration)
    ) {
        convertSymbols(context, type.getProperties());

        return ts.SymbolFlags.NamespaceModule;
    }

    return ts.SymbolFlags.None;
}

function convertSymbolAsClass(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
) {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Class,
        symbol,
        exportSymbol,
    );
    const rc = context.withScope(reflection);

    context.finalizeDeclarationReflection(reflection);

    if (!symbol.valueDeclaration) {
        context.logger.error(
            i18n.converting_0_as_class_requires_value_declaration(
                symbol.name,
            ),
            symbol.declarations?.[0],
        );
        return;
    }

    const type = context.checker.getTypeOfSymbolAtLocation(
        symbol,
        symbol.valueDeclaration,
    );

    rc.shouldBeStatic = true;
    convertSymbols(
        rc,
        // Prototype is implicitly this class, don't document it.
        type.getProperties().filter((prop) => prop.name !== "prototype"),
    );

    for (const sig of type.getCallSignatures()) {
        createSignature(rc, ReflectionKind.CallSignature, sig, undefined);
    }

    rc.shouldBeStatic = false;

    const ctors = type.getConstructSignatures();
    if (ctors.length) {
        const constructMember = rc.createDeclarationReflection(
            ReflectionKind.Constructor,
            ctors[0]?.declaration?.symbol,
            void 0,
            "constructor",
        );

        // Modifiers are the same for all constructors
        if (ctors.length && ctors[0].declaration) {
            setModifiers(symbol, ctors[0].declaration, constructMember);
        }

        context.finalizeDeclarationReflection(constructMember);

        const constructContext = rc.withScope(constructMember);

        for (const sig of ctors) {
            createConstructSignatureWithType(constructContext, sig, reflection);
        }

        // Take the type parameters from the first constructor signature and use
        // them as the type parameters for the class, #2914
        reflection.typeParameters = convertTypeParameters(rc, reflection, ctors[0].getTypeParameters());

        const instType = ctors[0].getReturnType();
        convertSymbols(rc, instType.getProperties());

        for (const sig of instType.getCallSignatures()) {
            createSignature(rc, ReflectionKind.CallSignature, sig, undefined);
        }
    } else {
        context.logger.warn(
            i18n.converting_0_as_class_without_construct_signatures(
                reflection.getFriendlyFullName(),
            ),
            symbol.valueDeclaration,
        );
    }

    return (
        ts.SymbolFlags.TypeAlias |
        ts.SymbolFlags.Interface |
        ts.SymbolFlags.Namespace
    );
}

function convertAccessor(
    context: Context,
    symbol: ts.Symbol,
    exportSymbol?: ts.Symbol,
): undefined {
    const reflection = context.createDeclarationReflection(
        ReflectionKind.Accessor,
        symbol,
        exportSymbol,
    );
    const rc = context.withScope(reflection);

    const declaration = symbol.getDeclarations()?.[0];
    if (declaration) {
        setModifiers(symbol, declaration, reflection);
    }

    context.finalizeDeclarationReflection(reflection);

    const getDeclaration = symbol.getDeclarations()?.find(ts.isGetAccessor);
    if (getDeclaration) {
        const signature = context.checker.getSignatureFromDeclaration(getDeclaration);
        if (signature) {
            createSignature(
                rc,
                ReflectionKind.GetSignature,
                signature,
                symbol,
                getDeclaration,
            );
        }
    }

    const setDeclaration = symbol.getDeclarations()?.find(ts.isSetAccessor);
    if (setDeclaration) {
        const signature = context.checker.getSignatureFromDeclaration(setDeclaration);
        if (signature) {
            createSignature(
                rc,
                ReflectionKind.SetSignature,
                signature,
                symbol,
                setDeclaration,
            );
        }
    }
}

function isInherited(context: Context, symbol: ts.Symbol) {
    const parentSymbol = context.getSymbolFromReflection(context.scope);
    // It'd be nice to be able to assert that this is true, but sometimes object
    // types don't get symbols if they are inferred.
    if (!parentSymbol) return false;

    const parents = parentSymbol.declarations?.slice() || [];
    const constructorDecls = parents.flatMap((parent) =>
        ts.isClassDeclaration(parent)
            ? parent.members.filter(ts.isConstructorDeclaration)
            : []
    );
    parents.push(...constructorDecls);

    return (
        parents.some((d) => symbol.getDeclarations()?.some((d2) => d2.parent === d)) === false
    );
}

function setModifiers(
    symbol: ts.Symbol,
    declaration: ts.Declaration | undefined,
    reflection: Reflection,
) {
    setSymbolModifiers(symbol, reflection);
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
        hasAllFlags(symbol.flags, ts.SymbolFlags.Optional),
    );
    reflection.setFlag(
        ReflectionFlag.Readonly,
        hasAllFlags(ts.getCheckFlags(symbol), ts.CheckFlags.Readonly) ||
            hasAllFlags(modifiers, ts.ModifierFlags.Readonly),
    );
    reflection.setFlag(
        ReflectionFlag.Abstract,
        hasAllFlags(modifiers, ts.ModifierFlags.Abstract),
    );

    if (
        reflection.kindOf(ReflectionKind.Variable) &&
        hasAllFlags(symbol.flags, ts.SymbolFlags.BlockScopedVariable)
    ) {
        reflection.setFlag(
            ReflectionFlag.Const,
            hasAllFlags(declaration.parent.flags, ts.NodeFlags.Const),
        );
    }

    // ReflectionFlag.Static happens when constructing the reflection.
    // We don't have sufficient information here to determine if it ought to be static.
}

function setSymbolModifiers(symbol: ts.Symbol, reflection: Reflection) {
    reflection.setFlag(
        ReflectionFlag.Optional,
        hasAllFlags(symbol.flags, ts.SymbolFlags.Optional),
    );
}

function shouldAutomaticallyConvertAsFunction(node: ts.Declaration): boolean {
    // const fn = () => {}
    if (ts.isVariableDeclaration(node)) {
        if (node.type || !node.initializer) return false;

        return isFunctionLikeInitializer(node.initializer);
    }

    // { fn: () => {} }
    if (ts.isPropertyAssignment(node)) {
        return isFunctionLikeInitializer(node.initializer);
    }

    // exports.fn = () => {}
    // exports.fn ||= () => {}
    // exports.fn ??= () => {}
    if (ts.isPropertyAccessExpression(node)) {
        if (
            ts.isBinaryExpression(node.parent) &&
            [ts.SyntaxKind.EqualsToken, ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.QuestionQuestionEqualsToken]
                .includes(node.parent.operatorToken.kind)
        ) {
            return isFunctionLikeInitializer(node.parent.right);
        }
    }

    return false;
}

function isFunctionLikeInitializer(node: ts.Expression): boolean {
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        return true;
    }

    if (ts.isSatisfiesExpression(node)) {
        return isFunctionLikeInitializer(node.expression);
    }

    if (ts.isAsExpression(node)) {
        return isFunctionLikeInitializer(node.expression);
    }

    return false;
}
