import * as ts from "typescript";

import {Context} from "../../Context";
import {Reflection, ReflectionKind} from "../../../models/Reflection";
import {convertNode, NodeConveter} from "../node";


export class ObjectLiteralConverter implements NodeConveter<ts.ObjectLiteralExpression>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.ObjectLiteralExpression
    ];


    /**
     * Analyze the given object literal node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The object literal node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.ObjectLiteralExpression):Reflection {
        if (node.properties) {
            node.properties.forEach((node) => {
                convertNode(context, node);
            });
        }

        return context.scope;
    }
}
