import * as ts from 'typescript';

import {Reflection, ReflectionFlag, DeclarationReflection} from '../../models/index';
import {Context} from '../context';
import {NodeConverter} from './node';

export class ExportConverter extends NodeConverter {
    /**
     * List of supported TypeScript syntax kinds.
     */
    static supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ExportAssignment
    ];

    convert(context: Context, node: ts.ExportAssignment): Reflection {
        let symbol: ts.Symbol = undefined;

        // default export
        if (node.symbol && (node.symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
            symbol = context.checker.getAliasedSymbol(node.symbol);
        } else {
            let type = context.getTypeAtLocation(node.expression);
            symbol = type ? type.symbol : undefined;
        }
        if (symbol) {
            const project = context.project;
            symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) {
                    return;
                }
                const id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id) {
                    return;
                }

                const reflection = project.reflections[id];
                if (node.isExportEquals && reflection instanceof DeclarationReflection) {
                    (<DeclarationReflection> reflection).setFlag(ReflectionFlag.ExportAssignment, true);
                }
                markAsExported(reflection);
            });
        }

        function markAsExported(reflection: Reflection) {
            if (reflection instanceof DeclarationReflection) {
                (<DeclarationReflection> reflection).setFlag(ReflectionFlag.Exported, true);
            }

            reflection.traverse(markAsExported);
        }

        return context.scope;
    }
}
