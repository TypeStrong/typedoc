import * as ts from 'typescript';

/**
 * Returns the type parameters of a given type.
 * @param type The type whos type parameters are wanted.
 * @returns The type parameters of the type.
 */
export function getTypeParametersOfType(type: ts.Type): ts.NodeArray<ts.TypeParameterDeclaration> | undefined {
    for (const declaration of type.symbol.declarations) {
        if (ts.isClassDeclaration(declaration)) {
            return declaration.typeParameters;
        }
    }

    return undefined;
}

/**
 * Returns a list of type arguments. If a type parameter has no corresponding type argument, the default type
 * for that type parameter is used as the type argument.
 * @param typeParams The type parameters for which the type arguments are wanted.
 * @param typeArguments The type arguments as provided in the declaration.
 * @returns The complete list of type arguments with possible default values if type arguments are missing.
 */
export function getTypeArgumentsWithDefaults(
    typeParams: ts.NodeArray<ts.TypeParameterDeclaration>,
    typeArguments?: ts.NodeArray<ts.TypeNode>
): ts.NodeArray<ts.TypeNode> {
    if (!typeArguments || typeParams.length > typeArguments.length) {
        const typeArgumentsWithDefaults = new Array<ts.TypeNode>();

        for (let i = 0; i < typeParams.length; ++i) {
            if (typeArguments && typeArguments[i]) {
                typeArgumentsWithDefaults.push(typeArguments[i]);
            } else if (typeParams[i].default) {
                typeArgumentsWithDefaults.push(typeParams[i].default!);
            }
        }

        return ts.createNodeArray<ts.TypeNode>(typeArgumentsWithDefaults);
    }

    return typeArguments;
}
