import * as ts from 'typescript';

/**
 * Returns the type parameters of a given type.
 * @param type The type whos type parameters are wanted.
 * @returns The type parameters of the type. An empty array if the type has no type parameters.
 */
export function getTypeParametersOfType(type: ts.Type): ReadonlyArray<ts.TypeParameterDeclaration> {
    const declarations = type.getSymbol()?.getDeclarations() ?? [];

    for (const declaration of declarations) {
        if ((ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)) &&
             declaration.typeParameters) {
            return declaration.typeParameters;
        }
    }

    return [];
}

/**
 * Returns a list of type arguments. If a type parameter has no corresponding type argument, the default type
 * for that type parameter is used as the type argument.
 * @param typeParams The type parameters for which the type arguments are wanted.
 * @param typeArguments The type arguments as provided in the declaration.
 * @returns The complete list of type arguments with possible default values if type arguments are missing.
 */
export function getTypeArgumentsWithDefaults(
    typeParams: ts.TypeParameterDeclaration[],
    typeArguments?: ReadonlyArray<ts.TypeNode>
): ReadonlyArray<ts.TypeNode> {
    if (!typeArguments || typeParams.length > typeArguments.length) {
        const typeArgumentsWithDefaults = new Array<ts.TypeNode>();

        for (let i = 0; i < typeParams.length; ++i) {
            if (typeArguments && typeArguments[i]) {
                typeArgumentsWithDefaults.push(typeArguments[i]);
            } else {
                const defaultType = typeParams[i].default;

                if (defaultType) {
                    typeArgumentsWithDefaults.push(defaultType);
                }
            }
        }

        return typeArgumentsWithDefaults;
    }

    return typeArguments;
}
