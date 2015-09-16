import * as ts from "typescript";

import {Reflection, ReflectionKind} from "../../models/index";
import {createDeclaration, createSignature} from "../factories/index";
import {Context} from "../context";
import {Converter} from "../converter";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:function'})
export class FunctionConverter extends ConverterNodeComponent<ts.FunctionDeclaration|ts.MethodDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.MethodSignature,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.FunctionDeclaration
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
