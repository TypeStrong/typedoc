import * as ts from "typescript";

import {ReflectionKind, SignatureReflection, ContainerReflection, DeclarationReflection, Type} from "../../models/index";
import {Context} from "../context";
import {Converter} from "../converter";
import {createParameter} from "./parameter";
import {createReferenceType} from "./reference";


/**
 * Create a new signature reflection from the given node.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The TypeScript node containing the signature declaration that should be reflected.
 * @param name  The name of the function or method this signature belongs to.
 * @param kind  The desired kind of the reflection.
 * @returns The newly created signature reflection describing the given node.
 */
export function createSignature(context:Context, node:ts.SignatureDeclaration, name:string, kind:ReflectionKind):SignatureReflection {
    var container = <DeclarationReflection>context.scope;
    if (!(container instanceof ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }

    var signature = new SignatureReflection(container, name, kind);
    context.registerReflection(signature, node);
    context.withScope(signature, node.typeParameters, true, () => {
        node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
            createParameter(context, parameter);
        });

        signature.type = extractSignatureType(context, node);

        if (container.inheritedFrom) {
            signature.inheritedFrom = createReferenceType(context, node.symbol, true);
        }
    });

    context.trigger(Converter.EVENT_CREATE_SIGNATURE, signature, node);
    return signature;
}




/**
 * Extract the return type of the given signature declaration.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The signature declaration whose return type should be determined.
 * @returns The return type reflection of the given signature.
 */
function extractSignatureType(context:Context, node:ts.SignatureDeclaration):Type {
    var checker = context.checker;
    if (node.kind & ts.SyntaxKind.CallSignature || node.kind & ts.SyntaxKind.CallExpression) {
        try {
            var signature = checker.getSignatureFromDeclaration(node);
            return context.converter.convertType(context, node.type, checker.getReturnTypeOfSignature(signature));
        } catch (error) {}
    }

    if (node.type) {
        return context.converter.convertType(context, node.type);
    } else {
        return context.converter.convertType(context, node);
    }
}
