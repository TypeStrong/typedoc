import * as ts from "typescript";

import {Context} from "../../Context";
import {Converter} from "../../Converter";
import {ITypeParameterContainer} from "../../../models/Reflection";
import {TypeParameterReflection} from "../../../models/reflections/TypeParameterReflection";
import {TypeParameterType} from "../../../models/types/TypeParameterType";
import {convertType} from "../type";


/**
 * Create a type parameter reflection for the given node.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The type parameter node that should be reflected.
 * @returns The newly created type parameter reflection.
 */
export function createTypeParameter(context:Context, node:ts.TypeParameterDeclaration):TypeParameterType {
    var typeParameter = new TypeParameterType();
    typeParameter.name = node.symbol.name;
    if (node.constraint) {
        typeParameter.constraint = convertType(context, node.constraint);
    }

    var reflection = <ITypeParameterContainer>context.scope;
    var typeParameterReflection = new TypeParameterReflection(reflection, typeParameter);

    if (!reflection.typeParameters) reflection.typeParameters = [];
    reflection.typeParameters.push(typeParameterReflection);

    context.registerReflection(typeParameterReflection, node);
    context.trigger(Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);

    return typeParameter;
}
