import * as ts from "typescript";

import {Context} from "../../Context";
import {Converter} from "../../Converter";
import {Reflection, ReflectionKind, ReflectionFlag} from "../../../models/Reflection";
import {DeclarationReflection} from "../../../models/reflections/DeclarationReflection";
import {ReferenceType} from "../../../models/types/ReferenceType";
import {Comment} from "../../../models/Comment";
import {convertNode, NodeConveter} from "../node";
import {convertType} from "../type";
import {createDeclaration} from "../factories/declaration";
import {createSignature} from "../factories/signature";


export class ConstructorConverter implements NodeConveter<ts.ConstructorDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.Constructor,
        ts.SyntaxKind.ConstructSignature
    ];


    /**
     * Analyze the given constructor declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The constructor declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.ConstructorDeclaration):Reflection {
        var parent = context.scope;
        var hasBody = !!node.body;
        var method = createDeclaration(context, node, ReflectionKind.Constructor, 'constructor');
        if (!method) {
            return null;
        }
        
        for (var parameter of node.parameters) {
            this.addParameterProperty(context, parameter, method.comment);
        }

        context.withScope(method, () => {
            if (!hasBody || !method.signatures) {
                var name = 'new ' + parent.name;
                var signature = createSignature(context, node, name, ReflectionKind.ConstructorSignature);
                signature.type = new ReferenceType(parent.name, ReferenceType.SYMBOL_ID_RESOLVED, parent);
                method.signatures = method.signatures || [];
                method.signatures.push(signature);
            } else {
                context.trigger(Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
            }
        });

        return method;
    }


    /**
     * Analyze parameters in given constructor declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The constructor declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    private addParameterProperty(context:Context, parameter:ts.ParameterDeclaration, comment:Comment) {
        var visibility = parameter.flags & (ts.NodeFlags.Public | ts.NodeFlags.Protected | ts.NodeFlags.Private);
        if (!visibility) return;

        var property = createDeclaration(context, parameter, ReflectionKind.Property);
        if (!property) return;

        property.setFlag(ReflectionFlag.Static, false);
        property.type = convertType(context, parameter.type, context.getTypeAtLocation(parameter));

        if (comment) {
            var tag = comment.getTag('param', property.name);
            if (tag && tag.text) {
                property.comment = new Comment(tag.text);
            }
        }
    }
}
