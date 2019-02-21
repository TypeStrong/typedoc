import * as ts from 'typescript';

import { Reflection, ReflectionFlag, DeclarationReflection, ReflectionKind } from '../../models/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { createDeclaration } from '../factories';

@Component({name: 'node:export'})
export class ExportConverter extends ConverterNodeComponent<ts.ExportAssignment> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ExportAssignment,
        ts.SyntaxKind.ExportDeclaration
    ];

    private _convertExportAllDeclaration(context: Context, moduleSpecifier: ts.Expression): Reflection | undefined {
        const symbol = context.checker.getSymbolAtLocation(moduleSpecifier);
        if (!symbol) {
            return context.scope;
        }

        const valueDeclaration = symbol.valueDeclaration;
        if (!valueDeclaration) {
            return context.scope;
        }

        if (!ts.isSourceFile(valueDeclaration)) {
            return context.scope;
        }

        valueDeclaration.statements.forEach((statement) => {
            this.owner.convertNode(context, statement);
        });

        return context.scope;
    }

    private _convertExportDeclaration(context: Context, node: ts.ExportDeclaration): Reflection | undefined {
        if (node.moduleSpecifier && !node.exportClause) {
            // export * from 'xxx';
            return this._convertExportAllDeclaration(context, node.moduleSpecifier);
        }

        // export { xx, xx as yy };
        node.exportClause!.elements.forEach((element) => {
            // export { q as quat };
            // q: propertyName
            // quat: name
            // export { quat };
            // quat: name
            const exportedSymbol = context.checker.getSymbolAtLocation(element.name);
            if (!exportedSymbol) {
                return;
            }
            const originalSymbol = context.checker.getAliasedSymbol(exportedSymbol);
            if (!originalSymbol) {
                return;
            }
            const declarations = originalSymbol.getDeclarations();
            if (!declarations) {
                return;
            }
            declarations.forEach((declaration) => {
                if (ts.isSourceFile(declaration)) {
                    // import * as xx from 'xx';
                    // export {xx};
                    const reflection = createDeclaration(context, element.name, ReflectionKind.Module, exportedSymbol.name);
                    if (reflection) {
                        reflection.setFlag(ReflectionFlag.Exported);
                        context.withScope(reflection, () => {
                            declaration.statements.forEach((statement) => {
                                this.owner.convertNode(context, statement);
                            });
                        });
                    }
                } else {
                    const reflection = this.owner.convertNode(context, declaration);
                    if (reflection) {
                        reflection.setFlag(ReflectionFlag.Exported);
                        reflection.name = exportedSymbol.name;
                    }
                }
            });
        });

        return context.scope;
    }

    convert(context: Context, node: ts.ExportAssignment | ts.ExportDeclaration): Reflection | undefined {
        if (ts.isExportDeclaration(node)) {
            return this._convertExportDeclaration(context, node);
        }

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
                }
                markAsExported(reflection);
            });
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
