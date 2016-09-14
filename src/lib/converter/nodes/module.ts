import * as ts from "typescript";

import {Reflection, ReflectionKind, ReflectionFlag, ProjectReflection} from "../../models/index";
import {createDeclaration} from "../factories/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:module'})
export class ModuleConverter extends ConverterNodeComponent<ts.ModuleDeclaration>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.ModuleDeclaration
    ];


    /**
     * Analyze the given module node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The module node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context:Context, node:ts.ModuleDeclaration):Reflection {
        var parent = context.scope;
        var reflection = createDeclaration(context, node, ReflectionKind.Module);

        context.withScope(reflection, () => {
            var opt = context.getCompilerOptions();
            if (parent instanceof ProjectReflection && !context.isDeclaration &&
                (!opt.module || (opt.module as any) === ts.ModuleKind.None)) {
                reflection.setFlag(ReflectionFlag.Exported);
            }

            if (node.body) {
                this.owner.convertNode(context, node.body);
            }
        });

        return reflection;
    }
}
