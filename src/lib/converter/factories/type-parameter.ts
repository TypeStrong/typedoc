import * as ts from 'typescript';

import { TypeParameterContainer, TypeParameterReflection, TypeParameterType } from '../../models/index';
import { Context } from '../context';
import { Converter } from '../converter';

/**
 * Create a type parameter reflection for the given node.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The type parameter node that should be reflected.
 * @returns The newly created type parameter reflection.
 */
export function createTypeParameter(context: Context, node: ts.TypeParameterDeclaration): TypeParameterType | undefined {
    if (!node.symbol) {
        return;
    }

    const typeParameter = new TypeParameterType(node.symbol.name);
    if (node.constraint) {
        typeParameter.constraint = context.converter.convertType(context, node.constraint);
    }

    const reflection = <TypeParameterContainer> context.scope;
    const typeParameterReflection = new TypeParameterReflection(typeParameter, reflection);

    if (!reflection.typeParameters) {
        reflection.typeParameters = [];
    }
    reflection.typeParameters.push(typeParameterReflection);

    context.registerReflection(typeParameterReflection, node);
    context.trigger(Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);

    return typeParameter;
}
