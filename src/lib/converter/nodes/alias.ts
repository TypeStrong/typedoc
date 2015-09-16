import * as ts from "typescript";

import {Reflection, ReflectionKind} from "../../models/index";
import {createDeclaration} from "../factories/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:alias'})
export class AliasConverter extends ConverterNodeComponent<ts.TypeAliasDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.TypeAliasDeclaration
    ];


    /**
     * Analyze the given type alias declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The type alias declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.TypeAliasDeclaration):Reflection {
        var alias = createDeclaration(context, node, ReflectionKind.TypeAlias);

        context.withScope(alias, () => {
            alias.type = this.owner.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });

        return alias;
    }
}
