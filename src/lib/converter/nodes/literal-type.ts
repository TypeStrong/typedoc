import * as ts from "typescript";

import {Reflection, ReflectionKind} from "../../models/index";
import {Context} from "../context";
import {convertNode, NodeConveter} from "../convert-node";


export class TypeLiteralConverter implements NodeConveter<ts.TypeLiteralNode>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.TypeLiteral
    ];


    /**
     * Analyze the given type literal node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The type literal node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.TypeLiteralNode):Reflection {
        if (node.members) {
            node.members.forEach((node) => {
                convertNode(context, node);
            });
        }

        return context.scope;
    }
}
