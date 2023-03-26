import ts from "typescript";
import assert from "assert";
import {
    ConversionFlags,
    DeclarationReflection,
    IntrinsicType,
    ParameterReflection,
    PredicateType,
    Reflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
    TypeParameterReflection,
    VarianceModifier,
} from "../../models";
import type { Context } from "../context";
import { ConverterEvents } from "../converter-events";
import { convertDefaultValue } from "../convert-expression";
import { removeUndefined } from "../utils/reflections";
import { ReflectionSymbolId } from "../../models/reflections/ReflectionSymbolId";

export function createSignature(
    context: Context,
    kind:
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.SetSignature,
    signature: ts.Signature,
    symbol: ts.Symbol | undefined,
    declaration?: ts.SignatureDeclaration | ts.JSDocSignature
) {
    assert(context.scope instanceof DeclarationReflection);

    declaration ||= signature.getDeclaration() as
        | ts.SignatureDeclaration
        | undefined;

    const sigRef = new SignatureReflection(
        kind == ReflectionKind.ConstructorSignature
            ? `new ${context.scope.parent!.name}`
            : context.scope.name,
        kind,
        context.scope
    );
    const sigRefCtx = context.withScope(sigRef);
    if (symbol && declaration) {
        context.project.registerSymbolId(
            sigRef,
            new ReflectionSymbolId(symbol, declaration)
        );
    }

    // If we are creating signatures for a variable or property and it has a comment associated with it
    // then we should prefer that comment over any comment on the signature. The comment plugin
    // will copy the comment down if this signature doesn't have one, so don't set one.
    let parentReflection = context.scope;
    if (
        parentReflection.kindOf(ReflectionKind.TypeLiteral) &&
        parentReflection.parent instanceof DeclarationReflection
    ) {
        parentReflection = parentReflection.parent;
    }

    if (
        declaration &&
        (!parentReflection.comment ||
            !(
                parentReflection.conversionFlags &
                ConversionFlags.VariableOrPropertySource
            ))
    ) {
        sigRef.comment = context.getSignatureComment(declaration);
    }

    sigRef.typeParameters = convertTypeParameters(
        sigRefCtx,
        sigRef,
        signature.typeParameters
    );

    const parameterSymbols: ReadonlyArray<ts.Symbol & { type?: ts.Type }> =
        signature.thisParameter
            ? [signature.thisParameter, ...signature.parameters]
            : signature.parameters;

    sigRef.parameters = convertParameters(
        sigRefCtx,
        sigRef,
        parameterSymbols,
        declaration?.parameters
    );

    const predicate = context.checker.getTypePredicateOfSignature(signature);
    if (predicate) {
        sigRef.type = convertPredicate(predicate, sigRefCtx);
    } else if (kind == ReflectionKind.SetSignature) {
        sigRef.type = new IntrinsicType("void");
    } else {
        sigRef.type = context.converter.convertType(
            sigRefCtx,
            (declaration?.kind === ts.SyntaxKind.FunctionDeclaration &&
                declaration.type) ||
                signature.getReturnType()
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
        signature
    );
}

function convertParameters(
    context: Context,
    sigRef: SignatureReflection,
    parameters: readonly (ts.Symbol & { type?: ts.Type })[],
    parameterNodes:
        | readonly ts.ParameterDeclaration[]
        | readonly ts.JSDocParameterTag[]
        | undefined
) {
    return parameters.map((param, i) => {
        const declaration = param.valueDeclaration as
            | ts.Declaration
            | undefined;
        assert(
            !declaration ||
                ts.isParameter(declaration) ||
                ts.isJSDocParameterTag(declaration)
        );
        const paramRefl = new ParameterReflection(
            /__\d+/.test(param.name) ? "__namedParameters" : param.name,
            ReflectionKind.Parameter,
            sigRef
        );
        if (declaration && ts.isJSDocParameterTag(declaration)) {
            paramRefl.comment = context.getJsDocComment(declaration);
        }
        paramRefl.comment ||= context.getComment(param, paramRefl.kind);

        context.registerReflection(paramRefl, param);
        context.trigger(ConverterEvents.CREATE_PARAMETER, paramRefl);

        let type: ts.Type | ts.TypeNode | undefined;
        if (declaration) {
            type = context.checker.getTypeOfSymbolAtLocation(
                param,
                declaration
            );
        } else {
            type = param.type;
        }

        paramRefl.type = context.converter.convertType(
            context.withScope(paramRefl),
            type
        );

        let isOptional = false;
        if (declaration) {
            isOptional = ts.isParameter(declaration)
                ? !!declaration.questionToken ||
                  ts
                      .getJSDocParameterTags(declaration)
                      .some((tag) => tag.isBracketed)
                : declaration.isBracketed;
        }

        if (isOptional) {
            paramRefl.type = removeUndefined(paramRefl.type);
        }

        paramRefl.defaultValue = convertDefaultValue(parameterNodes?.[i]);
        paramRefl.setFlag(ReflectionFlag.Optional, isOptional);

        // If we have no declaration, then this is an implicitly defined parameter in JS land
        // because the method body uses `arguments`... which is always a rest argument
        let isRest = true;
        if (declaration) {
            isRest = ts.isParameter(declaration)
                ? !!declaration.dotDotDotToken
                : !!declaration.typeExpression &&
                  ts.isJSDocVariadicType(declaration.typeExpression.type);
        }

        paramRefl.setFlag(ReflectionFlag.Rest, isRest);
        return paramRefl;
    });
}

export function convertParameterNodes(
    context: Context,
    sigRef: SignatureReflection,
    parameters: readonly (ts.JSDocParameterTag | ts.ParameterDeclaration)[]
) {
    return parameters.map((param) => {
        const paramRefl = new ParameterReflection(
            /__\d+/.test(param.name.getText())
                ? "__namedParameters"
                : param.name.getText(),
            ReflectionKind.Parameter,
            sigRef
        );
        if (ts.isJSDocParameterTag(param)) {
            paramRefl.comment = context.getJsDocComment(param);
        }
        context.registerReflection(
            paramRefl,
            context.getSymbolAtLocation(param)
        );
        context.trigger(ConverterEvents.CREATE_PARAMETER, paramRefl);

        paramRefl.type = context.converter.convertType(
            context.withScope(paramRefl),
            ts.isParameter(param) ? param.type : param.typeExpression?.type
        );

        const isOptional = ts.isParameter(param)
            ? !!param.questionToken
            : param.isBracketed;
        if (isOptional) {
            paramRefl.type = removeUndefined(paramRefl.type);
        }

        paramRefl.defaultValue = convertDefaultValue(param);
        paramRefl.setFlag(ReflectionFlag.Optional, isOptional);
        paramRefl.setFlag(
            ReflectionFlag.Rest,
            ts.isParameter(param)
                ? !!param.dotDotDotToken
                : !!param.typeExpression &&
                      ts.isJSDocVariadicType(param.typeExpression.type)
        );
        return paramRefl;
    });
}

function convertTypeParameters(
    context: Context,
    parent: Reflection,
    parameters: readonly ts.TypeParameter[] | undefined
) {
    return parameters?.map((param) => {
        const constraintT = param.getConstraint();
        const defaultT = param.getDefault();

        // There's no way to determine directly from a ts.TypeParameter what it's variance modifiers are
        // so unfortunately we have to go back to the node for this...
        const declaration = param
            .getSymbol()
            ?.declarations?.find(ts.isTypeParameterDeclaration);
        const variance = getVariance(declaration?.modifiers);

        const paramRefl = new TypeParameterReflection(
            param.symbol.name,
            parent,
            variance
        );
        const paramCtx = context.withScope(paramRefl);

        paramRefl.type = constraintT
            ? context.converter.convertType(paramCtx, constraintT)
            : void 0;
        paramRefl.default = defaultT
            ? context.converter.convertType(paramCtx, defaultT)
            : void 0;

        // No way to determine this from the type parameter itself, need to go back to the declaration
        if (
            declaration?.modifiers?.some(
                (m) => m.kind === ts.SyntaxKind.ConstKeyword
            )
        ) {
            paramRefl.flags.setFlag(ReflectionFlag.Const, true);
        }

        context.registerReflection(paramRefl, param.getSymbol());
        context.trigger(ConverterEvents.CREATE_TYPE_PARAMETER, paramRefl);

        return paramRefl;
    });
}

export function convertTypeParameterNodes(
    context: Context,
    parameters: readonly ts.TypeParameterDeclaration[] | undefined
) {
    return parameters?.map((param) =>
        createTypeParamReflection(param, context)
    );
}

export function createTypeParamReflection(
    param: ts.TypeParameterDeclaration,
    context: Context
) {
    const paramRefl = new TypeParameterReflection(
        param.name.text,
        context.scope,
        getVariance(param.modifiers)
    );
    const paramScope = context.withScope(paramRefl);
    paramRefl.type = param.constraint
        ? context.converter.convertType(paramScope, param.constraint)
        : void 0;
    paramRefl.default = param.default
        ? context.converter.convertType(paramScope, param.default)
        : void 0;
    if (param.modifiers?.some((m) => m.kind === ts.SyntaxKind.ConstKeyword)) {
        paramRefl.flags.setFlag(ReflectionFlag.Const, true);
    }

    context.registerReflection(paramRefl, param.symbol);

    if (ts.isJSDocTemplateTag(param.parent)) {
        paramRefl.comment = context.getJsDocComment(param.parent);
    }

    context.trigger(ConverterEvents.CREATE_TYPE_PARAMETER, paramRefl, param);
    return paramRefl;
}

function getVariance(
    modifiers: ts.ModifiersArray | undefined
): VarianceModifier | undefined {
    const hasIn = modifiers?.some(
        (mod) => mod.kind === ts.SyntaxKind.InKeyword
    );
    const hasOut = modifiers?.some(
        (mod) => mod.kind === ts.SyntaxKind.OutKeyword
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
    context: Context
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
            ? context.converter.convertType(context, predicate.type)
            : void 0
    );
}
