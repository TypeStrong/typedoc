import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { Reflection, ReflectionKind, DeclarationReflection } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { toArray } from 'lodash';

@Component({name: 'node:interface'})
export class InterfaceConverter extends ConverterNodeComponent<ts.InterfaceDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.InterfaceDeclaration
    ];

    /**
     * Analyze the given interface declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The interface declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.InterfaceDeclaration): Reflection | undefined {
        let reflection: DeclarationReflection | undefined;
        if (context.isInherit && context.inheritParent === node) {
            reflection = <DeclarationReflection> context.scope;
        } else {
            reflection = createDeclaration(context, node, ReflectionKind.Interface);
        }

        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    this.owner.convertNode(context, member);
                });
            }

            const extendsClause = toArray(node.heritageClauses).find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
            if (extendsClause) {
                extendsClause.types.forEach((baseType) => {
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
                            typeToInheritFrom.symbol && typeToInheritFrom.symbol.declarations.forEach((declaration) => {
                                context.inherit(declaration, baseType.typeArguments);
                            });
                        });
                    }
                });
            }
        });

        return reflection;
    }
}
