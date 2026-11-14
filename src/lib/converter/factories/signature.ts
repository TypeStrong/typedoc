import * as ts from "../../ts.js";
import assert from "assert";
import {
    ArrayType,
    DeclarationReflection,
    IntrinsicType,
    ParameterReflection,
    PredicateType,
    ReferenceType,
    type Reflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
    TypeParameterReflection,
    VarianceModifier,
} from "#models";
import type { Context } from "../context.js";
import { ConverterEvents } from "../converter-events.js";
import { convertDefaultValue } from "../convert-expression.js";
import { removeUndefined } from "../utilities/reflections.js";
import {
    getCombinedModifierFlags,
    getDeclarations,
    getReparsedJSDocTag,
    getSignatureDeclaration,
    getTypeAnnotation,
    getValueDeclaration,
} from "#node-utils";

export function convertConstructSignatures(context: Context, symbol: ts.Symbol) {
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

export function createSignature(
    context: Context,
    kind:
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.SetSignature,
    signature: ts.Signature,
    symbol: ts.Symbol | undefined,
    declaration?: ts.SignatureDeclaration,
) {
    assert(context.scope instanceof DeclarationReflection);

    declaration ||= getSignatureDeclaration(signature);

    const sigRef = new SignatureReflection(
        kind == ReflectionKind.ConstructorSignature
            ? context.scope.parent!.name
            : context.scope.name,
        kind,
        context.scope,
    );
    // This feels awful, but we need some way to tell if callable signatures on classes
    // are "static" (e.g. `Foo()`) or not (e.g. `(new Foo())()`)
    if (context.shouldBeStatic) {
        sigRef.setFlag(ReflectionFlag.Static);
    }
    if (symbol && declaration) {
        context.project.registerSymbolId(
            sigRef,
            context.createSymbolId(symbol, declaration),
        );
    }

    let parentReflection = context.scope;
    if (
        parentReflection.kindOf(ReflectionKind.TypeLiteral) &&
        parentReflection.parent instanceof DeclarationReflection
    ) {
        parentReflection = parentReflection.parent;
    }

    if (declaration) {
        const sigComment = context.getSignatureComment(declaration);
        if (parentReflection.comment?.discoveryId !== sigComment?.discoveryId) {
            sigRef.comment = sigComment;
            if (parentReflection.kindOf(ReflectionKind.MayContainDocuments)) {
                context.converter.processDocumentTags(sigRef, parentReflection);
            }
        }
    }

    const sigRefCtx = context.withScope(sigRef);
    sigRef.typeParameters = convertTypeParameters(
        sigRefCtx,
        sigRef,
        signature.getTypeParameters(),
    );

    const thisParameter = signature.getThisParameter();
    const parameterSymbols = thisParameter
        ? [thisParameter, ...signature.getParameters()]
        : signature.getParameters();

    sigRef.parameters = convertParameters(
        sigRefCtx,
        sigRef,
        parameterSymbols,
        declaration?.parameters,
    );

    const predicate = context.checker.getTypePredicateOfSignature(signature);
    if (predicate) {
        const predicateNode = declaration && getTypeAnnotation(declaration);
        sigRef.type = convertPredicate(
            predicate,
            sigRefCtx,
            predicateNode && ts.isTypePredicateNode(predicateNode) ? predicateNode.type : undefined,
        );
    } else if (kind == ReflectionKind.SetSignature) {
        sigRef.type = new IntrinsicType("void");
    } else if (declaration?.type?.kind === ts.SyntaxKind.ThisType) {
        sigRef.type = new IntrinsicType("this");
    } else {
        sigRef.type = context.converter.convertType(
            sigRefCtx,
            signature.getReturnType(),
            declaration && getTypeAnnotation(declaration),
        );
    }

    context.registerReflection(sigRef, undefined);

    switch (kind) {
        case ReflectionKind.GetSignature:
            context.scope.getSignature = sigRef;
            break;
        case ReflectionKind.SetSignature:
            context.scope.setSignature = sigRef;
            break;
        case ReflectionKind.CallSignature:
        case ReflectionKind.ConstructorSignature:
            context.scope.signatures ??= [];
            context.scope.signatures.push(sigRef);
            break;
    }

    context.converter.trigger(
        ConverterEvents.CREATE_SIGNATURE,
        context,
        sigRef,
        declaration,
        signature,
    );
}

/**
 * Special cased constructor factory for functions tagged with `@class`
 */
export function createConstructSignatureWithType(
    context: Context,
    signature: ts.Signature,
    classType: Reflection,
) {
    assert(context.scope instanceof DeclarationReflection);

    const declaration = getSignatureDeclaration(signature);

    const sigRef = new SignatureReflection(
        context.scope.parent!.name,
        ReflectionKind.ConstructorSignature,
        context.scope,
    );
    const sigRefCtx = context.withScope(sigRef);

    if (declaration) {
        sigRef.comment = context.getSignatureComment(declaration);
        if (sigRef.comment?.discoveryId === context.scope.parent?.comment?.discoveryId) {
            delete sigRef.comment;
        }
    }

    const thisParameter = signature.getThisParameter();
    const parameterSymbols = thisParameter
        ? [thisParameter, ...signature.getParameters()]
        : [...signature.getParameters()];

    // Prevent a `this` parameter from appearing on constructor signature
    // as TS disallows them on regular classes.
    if (parameterSymbols[0]?.name === "this") {
        parameterSymbols.shift();
    }

    sigRef.parameters = convertParameters(
        sigRefCtx,
        sigRef,
        parameterSymbols,
        declaration?.parameters,
    );
    sigRef.parameters = convertParameters(sigRefCtx, sigRef, parameterSymbols, undefined);

    // Do NOT convert type parameters here, they go on the class itself in the @class case
    // See #2914.

    sigRef.type = ReferenceType.createResolvedReference(
        context.scope.parent!.name,
        classType,
        context.project,
    );

    context.registerReflection(sigRef, undefined);

    context.scope.signatures ??= [];
    context.scope.signatures.push(sigRef);

    context.converter.trigger(
        ConverterEvents.CREATE_SIGNATURE,
        context,
        sigRef,
        declaration,
        signature,
    );
}

function convertParameters(
    context: Context,
    sigRef: SignatureReflection,
    parameters: readonly ts.Symbol[],
    parameterNodes: readonly ts.ParameterDeclaration[] | undefined,
) {
    // #2698 if `satisfies` is used to imply a this parameter, we might have
    // more parameters than parameter nodes and need to shift the parameterNode
    // access index. Very ugly, but it does the job.
    const parameterNodeOffset = parameterNodes?.length !== parameters.length ? -1 : 0;

    return parameters.map((param, i) => {
        const declaration = getValueDeclaration(param);
        assert(!declaration || ts.isParameterDeclaration(declaration));
        const paramRefl = new ParameterReflection(
            /^__\d+$/.test(param.name) ? "__namedParameters" : param.name,
            ReflectionKind.Parameter,
            sigRef,
        );
        const jsDocTag = declaration && getReparsedJSDocTag(declaration);
        if (jsDocTag && ts.isJSDocParameterTag(jsDocTag)) {
            paramRefl.comment = context.getJsDocComment(jsDocTag);
        }
        paramRefl.comment ||= context.getComment(param, paramRefl.kind);

        // #3111 if a parameter is a parameter property, then the parameter's comment should
        // not have @hidden applied, the parameter is still important, it's just the property which
        // should be hidden.
        if (
            declaration &&
            (getCombinedModifierFlags(declaration) &
                (ts.ModifierFlags.Public | ts.ModifierFlags.Private | ts.ModifierFlags.Protected |
                    ts.ModifierFlags.Readonly))
        ) {
            paramRefl.comment?.removeModifier("@hidden");
            paramRefl.comment?.removeModifier("@ignore");
            paramRefl.comment?.removeModifier("@internal");
        }

        context.registerReflection(paramRefl, param);
        context.converter.trigger(
            ConverterEvents.CREATE_PARAMETER,
            context,
            paramRefl,
        );

        let type: ts.Type | ts.TypeNode | undefined;
        let typeNode: ts.TypeNode | undefined;
        if (declaration) {
            type = context.checker.getTypeOfSymbolAtLocation(
                param,
                declaration,
            );
            typeNode = getTypeAnnotation(declaration);
        } else {
            type = context.checker.getTypeOfSymbol(param);
        }

        if (declaration?.type?.kind === ts.SyntaxKind.ThisType) {
            paramRefl.type = new IntrinsicType("this");
        } else {
            paramRefl.type = context.converter.convertType(
                context.withScope(paramRefl),
                type,
                typeNode,
            );
            if (jsDocTag && isJSDocVariadicParameterTag(jsDocTag) && paramRefl.type.type !== "array") {
                paramRefl.type = new ArrayType(paramRefl.type);
            }
        }

        const isOptional = !!declaration && isOptionalParameter(declaration);

        if (isOptional) {
            paramRefl.type = removeUndefined(paramRefl.type);
        }

        paramRefl.defaultValue = convertDefaultValue(
            parameterNodes?.[i + parameterNodeOffset],
        );
        paramRefl.setFlag(ReflectionFlag.Optional, isOptional);

        // If we have no declaration, then this is an implicitly defined parameter in JS land
        // because the method body uses `arguments`... which is always a rest argument,
        // unless it is a this parameter defined with @this in JSDoc.
        let isRest = param.name !== "this";
        if (declaration) {
            isRest = !!declaration.dotDotDotToken;
        }

        paramRefl.setFlag(ReflectionFlag.Rest, isRest);
        checkForDestructuredParameterDefaults(
            paramRefl,
            parameterNodes?.[i + parameterNodeOffset],
        );
        return paramRefl;
    });
}

export function convertParameterNodes(
    context: Context,
    sigRef: SignatureReflection,
    parameters: readonly ts.ParameterDeclaration[],
) {
    return parameters.map((param) => {
        const paramRefl = new ParameterReflection(
            /__\d+/.test(param.name.getText())
                ? "__namedParameters"
                : param.name.getText(),
            ReflectionKind.Parameter,
            sigRef,
        );
        // Parameters of a @callback are created from its @param tags.
        const jsDocTag = getReparsedJSDocTag(param);
        if (jsDocTag && ts.isJSDocParameterTag(jsDocTag)) {
            paramRefl.comment = context.getJsDocComment(jsDocTag);
            // #3111 don't need to check for @hidden here because this is only used
            // for cases where a parameter property is disallowed by TS.
        }
        context.registerReflection(
            paramRefl,
            context.getSymbolAtLocation(param),
        );
        context.converter.trigger(
            ConverterEvents.CREATE_PARAMETER,
            context,
            paramRefl,
        );

        paramRefl.type = context.converter.convertType(
            context.withScope(paramRefl),
            param.type,
        );
        if (jsDocTag && isJSDocVariadicParameterTag(jsDocTag)) {
            paramRefl.type = new ArrayType(paramRefl.type);
        }

        const isOptional = isOptionalParameter(param);
        if (isOptional) {
            paramRefl.type = removeUndefined(paramRefl.type);
        }

        paramRefl.defaultValue = convertDefaultValue(param);
        paramRefl.setFlag(ReflectionFlag.Optional, isOptional);
        paramRefl.setFlag(ReflectionFlag.Rest, !!param.dotDotDotToken);
        checkForDestructuredParameterDefaults(paramRefl, param);
        return paramRefl;
    });
}

// A @param {...T} tag is reparsed into a rest parameter of type T, which TypeDoc shows as T[].
function isJSDocVariadicParameterTag(tag: ts.JSDocTag) {
    return ts.isJSDocParameterTag(tag) &&
        !!tag.typeExpression &&
        ts.isJSDocTypeExpression(tag.typeExpression) &&
        ts.isJSDocVariadicType(tag.typeExpression.type);
}

// In JavaScript, a parameter is optional if its @param tag puts the name in brackets.
function isOptionalParameter(declaration: ts.ParameterDeclaration) {
    if (declaration.questionToken) {
        return true;
    }

    const reparsedTag = getReparsedJSDocTag(declaration);
    if (reparsedTag && ts.isJSDocParameterTag(reparsedTag)) {
        return reparsedTag.isBracketed;
    }

    const name = ts.isIdentifier(declaration.name) ? declaration.name.text : undefined;
    return !!name &&
        (declaration.parent.jsDoc ?? []).some((doc) =>
            (doc as ts.JSDoc).tags?.some((tag) =>
                ts.isJSDocParameterTag(tag) &&
                ts.isIdentifier(tag.name) &&
                tag.name.text === name &&
                tag.isBracketed
            )
        );
}

function checkForDestructuredParameterDefaults(
    param: ParameterReflection,
    decl: ts.ParameterDeclaration | undefined,
) {
    if (!decl) return;
    if (param.name !== "__namedParameters") return;
    if (!ts.isObjectBindingPattern(decl.name)) return;
    if (param.type?.type !== "reflection") return;

    for (const child of param.type.declaration.children || []) {
        const tsChild = decl.name.elements.find(
            (el) => (el.propertyName || el.name)?.getText() === child.name,
        );

        if (tsChild) {
            child.defaultValue = convertDefaultValue(tsChild);
        }
    }
}

export function convertTypeParameters(
    context: Context,
    parent: Reflection,
    parameters: readonly ts.TypeParameter[] | undefined,
) {
    if (!parameters?.length) {
        return;
    }

    return parameters.map((param) => {
        // TypeScript 6 returned the base constraint from getConstraint.
        const constraintT = context.checker.getBaseConstraintOfType(param);
        const defaultT = param.getDefault();

        // There's no way to determine directly from a ts.TypeParameter what it's variance modifiers are
        // so unfortunately we have to go back to the node for this...
        const paramSymbol = param.getSymbol();
        const declaration = paramSymbol && getDeclarations(paramSymbol).find(ts.isTypeParameterDeclaration);
        const variance = getVariance(declaration?.modifiers);

        const paramRefl = new TypeParameterReflection(
            paramSymbol?.name ?? context.checker.typeToString(param),
            parent,
            variance,
        );
        const paramCtx = context.withScope(paramRefl);

        // The declared nodes let the converter recover a `keyof` constraint, which
        // the TypeScript 7 API only returns as the resolved union of keys.
        paramRefl.type = constraintT
            ? context.converter.convertType(paramCtx, constraintT, declaration?.constraint)
            : void 0;
        paramRefl.default = defaultT
            ? context.converter.convertType(paramCtx, defaultT, declaration?.defaultType)
            : void 0;

        // No way to determine this from the type parameter itself, need to go back to the declaration
        if (
            declaration?.modifiers?.some(
                (m) => m.kind === ts.SyntaxKind.ConstKeyword,
            )
        ) {
            paramRefl.flags.setFlag(ReflectionFlag.Const, true);
        }

        context.registerReflection(paramRefl, param.getSymbol());
        context.converter.trigger(
            ConverterEvents.CREATE_TYPE_PARAMETER,
            context,
            paramRefl,
        );

        return paramRefl;
    });
}

export function convertTypeParameterNodes(
    context: Context,
    parameters: readonly ts.TypeParameterDeclaration[] | undefined,
) {
    return parameters?.map((param) => createTypeParamReflection(param, context));
}

export function createTypeParamReflection(
    param: ts.TypeParameterDeclaration,
    context: Context,
) {
    const paramRefl = new TypeParameterReflection(
        param.name.text,
        context.scope,
        getVariance(param.modifiers),
    );
    const paramScope = context.withScope(paramRefl);

    // A @template tag is reparsed into a type parameter, with the constraint
    // applied only to the first type parameter declared by the tag.
    paramRefl.type = param.constraint
        ? context.converter.convertType(paramScope, param.constraint)
        : void 0;

    paramRefl.default = param.defaultType
        ? context.converter.convertType(paramScope, param.defaultType)
        : void 0;

    if (param.modifiers?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword)) {
        paramRefl.flags.setFlag(ReflectionFlag.Const, true);
    }

    context.registerReflection(paramRefl, context.checker.getSymbolOfDeclaration(param));

    const templateTag = getReparsedJSDocTag(param);
    if (templateTag && ts.isJSDocTemplateTag(templateTag)) {
        paramRefl.comment = context.getJsDocComment(templateTag);
    }

    context.converter.trigger(
        ConverterEvents.CREATE_TYPE_PARAMETER,
        context,
        paramRefl,
        param,
    );
    return paramRefl;
}

function getVariance(
    modifiers: ts.NodeArray<ts.ModifierLike> | undefined,
): VarianceModifier | undefined {
    const hasIn = modifiers?.some(
        (mod) => mod.kind === ts.SyntaxKind.InKeyword,
    );
    const hasOut = modifiers?.some(
        (mod) => mod.kind === ts.SyntaxKind.OutKeyword,
    );

    if (hasIn && hasOut) {
        return VarianceModifier.inOut;
    }

    if (hasIn) {
        return VarianceModifier.in;
    }

    if (hasOut) {
        return VarianceModifier.out;
    }
}

function convertPredicate(
    predicate: ts.TypePredicate,
    context: Context,
    typeNode: ts.TypeNode | undefined,
): PredicateType {
    let name: string;
    switch (predicate.kind) {
        case ts.TypePredicateKind.This:
        case ts.TypePredicateKind.AssertsThis:
            name = "this";
            break;
        case ts.TypePredicateKind.Identifier:
        case ts.TypePredicateKind.AssertsIdentifier:
            name = predicate.parameterName;
            break;
    }

    let asserts: boolean;
    switch (predicate.kind) {
        case ts.TypePredicateKind.This:
        case ts.TypePredicateKind.Identifier:
            asserts = false;
            break;
        case ts.TypePredicateKind.AssertsThis:
        case ts.TypePredicateKind.AssertsIdentifier:
            asserts = true;
            break;
    }

    return new PredicateType(
        name,
        asserts,
        predicate.type
            ? context.converter.convertType(context, predicate.type, typeNode)
            : void 0,
    );
}
