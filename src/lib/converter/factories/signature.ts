import * as ts from "typescript";
import * as assert from "assert";
import {
    DeclarationReflection,
    ParameterReflection,
    Reflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
    TypeParameterReflection,
} from "../../models";
import { Context } from "../context";
import { ConverterEvents } from "../converter-events";
import { convertDefaultValue } from "../convert-expression";

export function createSignature(
    context: Context,
    kind:
        | ReflectionKind.CallSignature
        | ReflectionKind.ConstructorSignature
        | ReflectionKind.GetSignature
        | ReflectionKind.SetSignature,
    signature: ts.Signature,
    declaration?: ts.SignatureDeclaration
) {
    assert(context.scope instanceof DeclarationReflection);
    // signature.getDeclaration might return undefined.
    // https://github.com/microsoft/TypeScript/issues/30014
    declaration ??= signature.getDeclaration() as
        | ts.SignatureDeclaration
        | undefined;

    let commentDeclaration: ts.Node | undefined = declaration;
    if (commentDeclaration && ts.isArrowFunction(commentDeclaration)) {
        commentDeclaration = commentDeclaration.parent;
    }

    const sigRef = new SignatureReflection(
        context.scope.name,
        kind,
        context.scope
    );

    sigRef.typeParameters = convertTypeParameters(
        context,
        sigRef,
        signature.typeParameters,
        commentDeclaration
    );

    sigRef.parameters = convertParameters(
        context,
        sigRef,
        signature.parameters,
        declaration?.parameters
    );

    sigRef.type = context.converter.convertType(
        context,
        declaration?.type ?? signature.getReturnType(),
        declaration
    );

    context.registerReflection(sigRef, undefined);
    context.trigger(
        ConverterEvents.CREATE_SIGNATURE,
        sigRef,
        commentDeclaration
    );
    return sigRef;
}

function convertParameters(
    context: Context,
    sigRef: SignatureReflection,
    parameters: readonly ts.Symbol[],
    parameterNodes: readonly ts.ParameterDeclaration[] | undefined
) {
    return parameters.map((param, i) => {
        const declaration = param.valueDeclaration;
        assert(declaration && ts.isParameter(declaration));
        const paramRefl = new ParameterReflection(
            /__\d+/.test(param.name) ? "__namedParameters" : param.name,
            ReflectionKind.Parameter,
            sigRef
        );
        context.registerReflection(paramRefl, param);

        paramRefl.type = context.converter.convertType(
            context.withScope(paramRefl),
            parameterNodes?.[i].type ?? getTypeOfSymbol(param, context),
            parameterNodes?.[i]
        );

        paramRefl.defaultValue = convertDefaultValue(parameterNodes?.[i]);
        paramRefl.setFlag(ReflectionFlag.Optional, !!declaration.questionToken);
        paramRefl.setFlag(ReflectionFlag.Rest, !!declaration.dotDotDotToken);
        return paramRefl;
    });
}

function convertTypeParameters(
    context: Context,
    parent: Reflection,
    parameters: readonly ts.TypeParameter[] | undefined,
    typeContextNode: ts.Node | undefined
) {
    return parameters?.map((param) => {
        const constraintT = param.getConstraint();
        const defaultT = param.getDefault();

        const constraint = constraintT
            ? context.converter.convertType(
                  context,
                  constraintT,
                  typeContextNode
              )
            : void 0;
        const defaultType = defaultT
            ? context.converter.convertType(context, defaultT, typeContextNode)
            : void 0;
        const paramRefl = new TypeParameterReflection(
            param.symbol.name,
            constraint,
            defaultType,
            parent
        );
        context.registerReflection(paramRefl, undefined);
        context.trigger(ConverterEvents.CREATE_TYPE_PARAMETER, paramRefl);

        return paramRefl;
    });
}

function getTypeOfSymbol(symbol: ts.Symbol, context: Context) {
    const decl = symbol.getDeclarations()?.[0];
    return decl
        ? context.checker.getTypeOfSymbolAtLocation(symbol, decl)
        : context.checker.getDeclaredTypeOfSymbol(symbol);
}
