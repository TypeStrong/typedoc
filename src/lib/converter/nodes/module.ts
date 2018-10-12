import * as ts from 'typescript';

import { Reflection, ReflectionKind, ReflectionFlag, ProjectReflection } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';

@Component({name: 'node:module'})
export class ModuleConverter extends ConverterNodeComponent<ts.ModuleDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ModuleDeclaration
    ];

    /**
     * Analyze the given module node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The module node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.ModuleDeclaration): Reflection | undefined {
        const parent = context.scope;
        const reflection = createDeclaration(context, node, ReflectionKind.Module);

        context.withScope(reflection, () => {
            if (parent instanceof ProjectReflection && !context.isDeclaration &&
                (!module || module.valueOf() === ts.ModuleKind.None.valueOf())) {
                reflection!.setFlag(ReflectionFlag.Exported);
            }

            if (node.body) {
                this.owner.convertNode(context, node.body);
            }
        });

        return reflection;
    }
}
