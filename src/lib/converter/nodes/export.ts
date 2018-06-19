import * as ts from 'typescript';

import { DeclarationReflection, ExportDeclarationReflection, markAsExported, Reflection, ReflectionFlag } from '../../models/index';
import { Component, ConverterNodeComponent } from '../components';
import { Context } from '../context';

@Component({name: 'node:export'})
export class ExportConverter extends ConverterNodeComponent<ts.ExportAssignment> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ExportAssignment,
        ts.SyntaxKind.ExportDeclaration
    ];

    convert(context: Context, node: ts.ExportAssignment | ts.ExportDeclaration): Reflection {
        if (ts.isExportDeclaration(node)) {
            return this.convertExportDeclaration(context, node);
        }

        return this.convertExportAssignment(context, node);
    }

    convertExportAssignment(context: Context, node: ts.ExportAssignment): Reflection {
        let symbol: ts.Symbol | undefined;

        // default export
        if (node.symbol && (node.symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
            symbol = context.checker.getAliasedSymbol(node.symbol);
        } else {
            let type = context.getTypeAtLocation(node.expression);
            symbol = type ? type.symbol : undefined;
        }
        if (symbol && symbol.declarations) {
            const project = context.project;
            symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) {
                    return;
                }
                const id = project.symbolMapping[context.getSymbolID(declaration.symbol)!];
                if (!id) {
                    return;
                }

                const reflection = project.reflections[id];
                if (node.isExportEquals && reflection instanceof DeclarationReflection) {
                    reflection.setFlag(ReflectionFlag.ExportAssignment, true);
                    reflection.setFlag(ReflectionFlag.Export, true);
                }
                markAsExported(reflection);
            });
        }

        return context.scope;
    }

    convertExportDeclaration(context: Context, node: ts.ExportDeclaration): Reflection {
        const scope = context.scope;
        if (!(scope instanceof DeclarationReflection)) {
            throw new Error('we expect to have for scope a module declaration');
        }

        // We just create a reflection which will be finalized later.
        return new ExportDeclarationReflection(node, scope);
    }
}
