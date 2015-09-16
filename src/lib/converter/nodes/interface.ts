import * as ts from "typescript";

import {Reflection, ReflectionKind, DeclarationReflection} from "../../models/index";
import {createDeclaration} from "../factories/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:interface'})
export class InterfaceConverter extends ConverterNodeComponent<ts.InterfaceDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.InterfaceDeclaration
    ];


    /**
     * Analyze the given interface declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The interface declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.InterfaceDeclaration):Reflection {
        var reflection:DeclarationReflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = <DeclarationReflection>context.scope;
        } else {
            reflection = createDeclaration(context, node, ReflectionKind.Interface);
        }

        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member, isInherit) => {
                    this.owner.convertNode(context, member);
                });
            }

            var baseTypes = ts.getInterfaceBaseTypeNodes(node);
            if (baseTypes) {
                baseTypes.forEach((baseType) => {
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
                });
            }
        });

        return reflection;
    }
}
