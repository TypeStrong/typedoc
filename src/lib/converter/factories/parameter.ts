import * as ts from 'typescript';

import { ReflectionFlag, ReflectionKind, ParameterReflection, SignatureReflection } from '../../models/reflections/index';
import { Context } from '../context';
import { Converter } from '../converter';
import { convertDefaultValue } from '../convert-expression';

/**
 * Create a parameter reflection for the given node.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The parameter node that should be reflected.
 * @returns The newly created parameter reflection.
 */
export function createParameter(context: Context, node: ts.ParameterDeclaration): ParameterReflection | undefined {
    if (!(context.scope instanceof SignatureReflection)) {
        throw new Error('Expected signature reflection.');
    }
    const signature = context.scope;

    if (!node.symbol) {
        return;
    }

    const parameter = new ParameterReflection(node.symbol.name, ReflectionKind.Parameter, signature);
    context.registerReflection(parameter, node);
    context.withScope(parameter, () => {
        if (ts.isArrayBindingPattern(node.name) || ts.isObjectBindingPattern(node.name)) {
            parameter.type = context.converter.convertType(context, node.name);
            parameter.name = '__namedParameters';
        } else {
            parameter.type = context.converter.convertType(context, node.type, context.getTypeAtLocation(node));
        }

        parameter.defaultValue = convertDefaultValue(node);
        parameter.setFlag(ReflectionFlag.Optional, !!node.questionToken);
        parameter.setFlag(ReflectionFlag.Rest, !!node.dotDotDotToken);
        parameter.setFlag(ReflectionFlag.DefaultValue, !!parameter.defaultValue);

        if (!signature.parameters) {
            signature.parameters = [];
        }
        signature.parameters.push(parameter);
    });

    context.trigger(Converter.EVENT_CREATE_PARAMETER, parameter, node);
    return parameter;
}
