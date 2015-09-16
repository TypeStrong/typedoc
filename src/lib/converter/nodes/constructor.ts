import * as ts from "typescript";

import {Reflection, ReflectionKind, ReflectionFlag, DeclarationReflection, ReferenceType, Comment} from "../../models/index";
import {createDeclaration, createSignature, createComment} from "../factories/index";
import {Context} from "../context";
import {Converter} from "../converter";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:constructor'})
export class ConstructorConverter extends ConverterNodeComponent<ts.ConstructorDeclaration>
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

        if (node.parameters && node.parameters.length) {
            var comment = method ? method.comment : createComment(node);
            for (var parameter of node.parameters) {
                this.addParameterProperty(context, parameter, comment);
            }
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
        property.type = this.owner.convertType(context, parameter.type, context.getTypeAtLocation(parameter));

        if (comment) {
            var tag = comment.getTag('param', property.name);
            if (tag && tag.text) {
                property.comment = new Comment(tag.text);
            }
        }
    }
}
