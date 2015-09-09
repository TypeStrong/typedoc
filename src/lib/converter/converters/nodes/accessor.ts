import * as ts from "typescript";

import {Reflection, ReflectionKind} from "../../../models/Reflection";
import {Context} from "../../Context";
import {NodeConveter} from "../node";

import {createDeclaration} from "../factories/declaration";
import {createSignature} from "../factories/signature";


export class AccessorConverter implements NodeConveter<ts.SignatureDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.GetAccessor,
        ts.SyntaxKind.SetAccessor
    ];


    /**
     * Analyze the given getter declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The signature declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.SignatureDeclaration):Reflection {
        var accessor = createDeclaration(context, node, ReflectionKind.Accessor);

        context.withScope(accessor, () => {
            if (node.kind == ts.SyntaxKind.GetAccessor) {
                accessor.getSignature = createSignature(context, node, '__get', ReflectionKind.GetSignature);
            } else {
                accessor.setSignature = createSignature(context, node, '__set', ReflectionKind.SetSignature);
            }
        });

        return accessor;
    }
}
