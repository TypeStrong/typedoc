import * as ts from "typescript";
import {
    ParameterReflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
} from "../../models";
import { Context } from "../context";
import { convertDefaultValue } from "../convert-expression";
import { Converter } from "../converter";

/**
 * Create a parameter reflection for the given node.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The parameter node that should be reflected.
 * @returns The newly created parameter reflection.
 */
export function createParameter(
    context: Context,
    node: ts.ParameterDeclaration
): ParameterReflection | undefined {
    if (!(context.scope instanceof SignatureReflection)) {
        throw new Error("Expected signature reflection.");
    }
    const signature = context.scope;

    if (!node.symbol) {
        return;
    }

    const parameter = new ParameterReflection(
        node.symbol.name,
        ReflectionKind.Parameter,
        signature
    );
    context.registerReflection(parameter);
    context.withScope(parameter, () => {
        parameter.type = context.converter.convertType(
            context,
            node.type ?? context.getTypeAtLocation(node)
        );

        if (
            ts.isArrayBindingPattern(node.name) ||
            ts.isObjectBindingPattern(node.name)
        ) {
            parameter.name = "__namedParameters";
        }

        parameter.defaultValue = convertDefaultValue(node);
        parameter.setFlag(ReflectionFlag.Optional, !!node.questionToken);
        parameter.setFlag(ReflectionFlag.Rest, !!node.dotDotDotToken);
        parameter.setFlag(
            ReflectionFlag.DefaultValue,
            !!parameter.defaultValue
        );

        if (!signature.parameters) {
            signature.parameters = [];
        }
        signature.parameters.push(parameter);
    });

    context.trigger(Converter.EVENT_CREATE_PARAMETER, parameter, node);
    return parameter;
}
