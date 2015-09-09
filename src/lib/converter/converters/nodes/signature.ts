import * as ts from "typescript";

import {Context} from "../../Context";
import {Reflection, ReflectionKind} from "../../../models/Reflection";
import {NodeConveter} from "../node";
import {DeclarationReflection} from "../../../models/reflections/DeclarationReflection";
import {createSignature} from "../factories/signature";


export class SignatureConverter implements NodeConveter<ts.FunctionExpression|ts.SignatureDeclaration|ts.FunctionExpression>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.CallSignature,
        ts.SyntaxKind.FunctionType,
        ts.SyntaxKind.FunctionExpression,
        ts.SyntaxKind.ArrowFunction
    ];


    /**
     * Analyze the given call signature declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The signature declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.FunctionExpression|ts.SignatureDeclaration|ts.FunctionExpression):Reflection {
        var scope = <DeclarationReflection>context.scope;
        if (scope instanceof DeclarationReflection) {
            var name = scope.kindOf(ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            var signature = createSignature(context, <ts.SignatureDeclaration>node, name, ReflectionKind.CallSignature);
            if (!scope.signatures) scope.signatures = [];
            scope.signatures.push(signature);
        }

        return scope;
    }
}
