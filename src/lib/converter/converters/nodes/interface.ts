import * as ts from "typescript";

import {Context} from "../../Context";
import {Reflection, ReflectionKind} from "../../../models/Reflection";
import {convertNode, NodeConveter} from "../node";
import {DeclarationReflection} from "../../../models/reflections/DeclarationReflection";
import {createDeclaration} from "../factories/declaration";
import {convertType} from "../type";


export class InterfaceConverter implements NodeConveter<ts.InterfaceDeclaration>
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
                    convertNode(context, member);
                });
            }

            var baseTypes = ts.getInterfaceBaseTypeNodes(node);
            if (baseTypes) {
                baseTypes.forEach((baseType) => {
                    var type = context.getTypeAtLocation(baseType);
                    if (!context.isInherit) {
                        if (!reflection.extendedTypes) reflection.extendedTypes = [];
                        reflection.extendedTypes.push(convertType(context, baseType, type));
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
