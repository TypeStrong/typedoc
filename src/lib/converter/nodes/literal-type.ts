import * as ts from "typescript";

import {Reflection, ReflectionKind} from "../../models/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:literal-type'})
export class TypeLiteralConverter extends ConverterNodeComponent<ts.TypeLiteralNode>
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
                this.owner.convertNode(context, node);
            });
        }

        return context.scope;
    }
}
