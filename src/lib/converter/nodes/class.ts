import * as ts from "typescript";

import {Reflection, ReflectionKind, DeclarationReflection} from "../../models/index";
import {createDeclaration} from "../factories/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:class'})
export class ClassConverter extends ConverterNodeComponent<ts.ClassDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
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
    convert(context:Context, node:ts.ClassDeclaration):Reflection {
        var reflection:DeclarationReflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = <DeclarationReflection>context.scope;
        } else {
            reflection = createDeclaration(context, node, ReflectionKind.Class);
        }

        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    this.owner.convertNode(context, member);
                });
            }

            var baseType = ts.getClassExtendsHeritageClauseElement(node);
            if (baseType) {
                var type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection.extendedTypes) reflection.extendedTypes = [];
                    reflection.extendedTypes.push(this.owner.convertType(context, baseType, type));
                }

                if (type && type.symbol) {
                    type.symbol.declarations.forEach((declaration) => {
                        context.inherit(declaration, baseType.typeArguments);
                    });
                }
            }

            var implementedTypes = ts.getClassImplementsHeritageClauseElements(node);
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
