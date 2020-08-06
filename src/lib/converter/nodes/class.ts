import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { Reflection, ReflectionFlag, ReflectionKind, DeclarationReflection } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { toArray } from 'lodash';

@Component({name: 'node:class'})
export class ClassConverter extends ConverterNodeComponent<ts.ClassDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ClassExpression,
        ts.SyntaxKind.ClassDeclaration
    ];

    /**
     * Analyze the given class declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The class declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.ClassDeclaration): Reflection | undefined {
        let reflection: DeclarationReflection | undefined;
        if (context.isInherit && context.inheritParent === node) {
            reflection = <DeclarationReflection> context.scope;
        } else {
            reflection = createDeclaration(context, node, ReflectionKind.Class);
            // set possible abstract flag here, where node is not the inherited parent
            if (reflection && node.modifiers && node.modifiers.some( m => m.kind === ts.SyntaxKind.AbstractKeyword )) {
                reflection.setFlag(ReflectionFlag.Abstract, true);
            }
        }

        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    const child = this.owner.convertNode(context, member);
                    // class Foo { #foo = 1 }
                    if (child && member.name && ts.isPrivateIdentifier(member.name)) {
                        child.flags.setFlag(ReflectionFlag.Private, true);
                    }
                });
            }

            const extendsClause = toArray(node.heritageClauses).find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
            if (extendsClause) {
                const baseType = extendsClause.types[0];
                const type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection!.extendedTypes) {
                        reflection!.extendedTypes = [];
                    }
                    const convertedType = this.owner.convertType(context, baseType, type);
                    if (convertedType) {
                        reflection!.extendedTypes.push(convertedType);
                    }
                }

                if (type) {
                    const typesToInheritFrom: ts.Type[] = type.isIntersection() ? type.types : [ type ];

                    typesToInheritFrom.forEach((typeToInheritFrom: ts.Type) => {
                        // TODO: The TS declaration file claims that:
                        // 1. type.symbol is non-nullable
                        // 2. symbol.declarations is non-nullable
                        // These are both incorrect, GH#1207 for #2 and existing tests for #1.
                        // Figure out why this is the case and document.
                        typeToInheritFrom.symbol?.declarations?.forEach((declaration) => {
                            let typeArguments = baseType.typeArguments;

                            if (ts.isClassDeclaration(declaration) && declaration.typeParameters) {
                                typeArguments = this.getTypeArgumentsWithDefaults(
                                    declaration.typeParameters,
                                    baseType.typeArguments
                                );
                            }

                            context.inherit(declaration, typeArguments);
                        });
                    });
                }
            }

            const implementsClause = toArray(node.heritageClauses).find(h => h.token === ts.SyntaxKind.ImplementsKeyword);
            if (implementsClause) {
                const implemented = this.owner.convertTypes(context, implementsClause.types);
                reflection!.implementedTypes = (reflection!.implementedTypes || []).concat(implemented);
            }
        });

        return reflection;
    }

    /**
     * Returns a list of type arguments. If a type parameter has no corresponding type argument, the default type
     * for that type parameter is used as the type argument.
     * @param typeParams The type parameters for which the type arguments are wanted.
     * @param typeArguments The type arguments as provided in the declaration.
     * @returns The complete list of type arguments with possible default values if type arguments are missing.
     */
    getTypeArgumentsWithDefaults(
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
}
