import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { Reflection, ReflectionFlag, ReflectionKind, DeclarationReflection } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';

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
    convert(context: Context, node: ts.ClassDeclaration): Reflection {
        let reflection: DeclarationReflection;
        if (context.isInherit && context.inheritParent === node) {
            reflection = <DeclarationReflection> context.scope;
        } else {
            reflection = createDeclaration(context, node, ReflectionKind.Class);
            // set possible abstract flag here, where node is not the inherited parent
            if (node.modifiers && node.modifiers.some( m => m.kind === ts.SyntaxKind.AbstractKeyword )) {
                reflection.setFlag(ReflectionFlag.Abstract, true);
            }
        }

        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    const modifiers = ts.getCombinedModifierFlags(member);
                    const privateMember = (modifiers & ts.ModifierFlags.Private) > 0;
                    const protectedMember = (modifiers & ts.ModifierFlags.Protected) > 0;
                    const exclude = (context.converter.excludePrivate && privateMember)
                        || (context.converter.excludeProtected && protectedMember);

                    if (!exclude) {
                        this.owner.convertNode(context, member);
                    }
                });
            }

            const baseType = _ts.getClassExtendsHeritageClauseElement(node);
            if (baseType) {
                const type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection.extendedTypes) {
                        reflection.extendedTypes = [];
                    }
                    reflection.extendedTypes.push(this.owner.convertType(context, baseType, type));
                }

                if (type && type.symbol) {
                    type.symbol.declarations.forEach((declaration) => {
                        context.inherit(declaration, baseType.typeArguments);
                    });
                }
            }

            const implementedTypes = _ts.getClassImplementsHeritageClauseElements(node);
            if (implementedTypes) {
                implementedTypes.forEach((implementedType) => {
                    if (!reflection.implementedTypes) {
                        reflection.implementedTypes = [];
                    }

                    reflection.implementedTypes.push(this.owner.convertType(context, implementedType));
                });
            }
        });

        return reflection;
    }
}
