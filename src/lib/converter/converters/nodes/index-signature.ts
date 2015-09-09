import * as ts from "typescript";

import {Context} from "../../Context";
import {Reflection, ReflectionKind} from "../../../models/Reflection";
import {NodeConveter} from "../node";
import {DeclarationReflection} from "../../../models/reflections/DeclarationReflection";
import {createSignature} from "../factories/signature";


export class IndexSignatureConverter implements NodeConveter<ts.SignatureDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.IndexSignature
    ];


    /**
     * Analyze the given index signature declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The signature declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.SignatureDeclaration):Reflection {
        var scope = <DeclarationReflection>context.scope;
        if (scope instanceof DeclarationReflection) {
            scope.indexSignature = createSignature(context, node, '__index', ReflectionKind.IndexSignature);
        }

        return scope;
    }
}
