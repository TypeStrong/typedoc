import * as ts from "typescript";

import {Context} from "../../Context";
import {Converter} from "../../Converter";
import {Reflection, ReflectionKind} from "../../../models/Reflection";
import {NodeConveter} from "../node";
import {createDeclaration} from "../factories/declaration";
import {createSignature} from "../factories/signature";


export class FunctionConverter implements NodeConveter<ts.FunctionDeclaration|ts.MethodDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.MethodSignature,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.FunctionExpression,
        ts.SyntaxKind.ArrowFunction
    ];


    /**
     * Analyze the given function declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The function declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.FunctionDeclaration|ts.MethodDeclaration):Reflection {
        var scope   = context.scope;
        var kind    = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
        var hasBody = !!node.body;
        var method  = createDeclaration(context, <ts.Node>node, kind);

        context.withScope(method, () => {
            if (!hasBody || !method.signatures) {
                var signature = createSignature(context, <ts.SignatureDeclaration>node, method.name, ReflectionKind.CallSignature);
                if (!method.signatures) method.signatures = [];
                method.signatures.push(signature);
            } else {
                context.trigger(Converter.EVENT_FUNCTION_IMPLEMENTATION, method, <ts.Node>node);
            }
        });

        return method;
    }
}
