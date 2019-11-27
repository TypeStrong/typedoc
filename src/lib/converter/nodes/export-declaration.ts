import * as ts from 'typescript';

import { Reflection, ReflectionFlag, DeclarationReflection } from '../../models/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';

@Component({name: 'node:export-declaration'})
export class ExportDeclarationConverter extends ConverterNodeComponent<ts.ExportDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ExportDeclaration
    ];

    convert(context: Context, node: ts.ExportDeclaration): Reflection {
        // export list declaration (export {Foo, Bar};)
        if (node && node.exportClause) {
            const project = context.project;
            for (const exportSpecifier of node.exportClause.elements) {
                const identifier = exportSpecifier.name.text;
                const reflection = project.findReflectionByName(identifier);
                if (reflection) {
                    markAsExported(reflection);
                }
            }
        }

        function markAsExported(reflection: Reflection) {
            if (reflection instanceof DeclarationReflection) {
                reflection.setFlag(ReflectionFlag.Exported, true);
            }

            reflection.traverse(markAsExported);
        }

        return context.scope;
    }
}
