import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { Reflection, ReflectionFlag, ReflectionKind, DeclarationReflection } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { toArray } from 'lodash';
import { getTypeArgumentsWithDefaults, getTypeParametersOfType } from '../utils/types';

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

                    // Get type parameters of all types
                    let typeParams: ts.TypeParameterDeclaration[] = [];
                    for (const typeToInheritFrom of typesToInheritFrom) {
                        typeParams = typeParams.concat(getTypeParametersOfType(typeToInheritFrom));
                    }

                    const typeArguments = typeParams.length > 0
                        ? getTypeArgumentsWithDefaults(typeParams, baseType.typeArguments)
                        : undefined;

                    typesToInheritFrom.forEach((typeToInheritFrom: ts.Type) => {
                        // TODO: The TS declaration file claims that:
                        // 1. type.symbol is non-nullable
                        // 2. symbol.declarations is non-nullable
                        // These are both incorrect, GH#1207 for #2 and existing tests for #1.
                        // Figure out why this is the case and document.
                        typeToInheritFrom.symbol?.declarations?.forEach((declaration) => {
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
}
