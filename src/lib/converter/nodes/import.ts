import * as ts from 'typescript';

import { Reflection, DeclarationReflection } from '../../models/index';
import { createDeclaration } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';

@Component({name: 'node:import'})
export class ImportConverter extends ConverterNodeComponent<ts.ImportDeclaration | ts.ImportEqualsDeclaration> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ImportDeclaration,
        ts.SyntaxKind.ImportEqualsDeclaration
    ];

    convert(context: Context, node: ts.ImportDeclaration | ts.ImportEqualsDeclaration): Reflection {
        // import * as foo from 'xx'
        // import { MyType, MyVar as ImportedVar } from 'xx'
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const importDeclarationNode = node as ts.ImportDeclaration;
            const importClause = importDeclarationNode.importClause;

            if (importClause) {
                // import myType from 'default-export';
                if (importClause.symbol) {
                    this.createImportedSymbolDeclarationForAlias(context, node, importClause.symbol);
                } else if (importClause.namedBindings) {
                    // import { MyType, MyVar as ImportedVar } from 'xx'
                    if (importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
                        const namedImports = importClause.namedBindings as ts.NamedImports;
                        namedImports.elements.forEach(imp => {
                            if (imp.symbol) {
                                this.createImportedSymbolDeclarationForAlias(context, node, imp.symbol);
                            }
                        });
                    // import * as foo from 'xx'
                    } else if (importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
                        const nsImport = importClause.namedBindings as ts.NamespaceImport;
                        if (nsImport.symbol) {
                            this.createImportedSymbolDeclarationForAlias(context, node, nsImport.symbol);
                        }
                   }
                }
            }
        // import foo = Foo;
        // import bar = require('bar');
        } else if (node.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            const importEqualsDeclaration = node as ts.ImportEqualsDeclaration;
            const moduleRef = importEqualsDeclaration.moduleReference;
            const type = context.checker.getTypeAtLocation(moduleRef);

            if (type) {
                this.createImportedSymbolDeclaration(context, node, type.symbol, node.symbol.name);
            }
        }
        return context.scope;
    }

    private createImportedSymbolDeclarationForAlias(context: Context, node: ts.Node, symbol: ts.Symbol): void {
        if (symbol && (symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
            this.createImportedSymbolDeclaration(context, node, context.checker.getAliasedSymbol(symbol), symbol.name);
        }
    }

    private createImportedSymbolDeclaration(context: Context, node: ts.Node, symbol: ts.Symbol, name: string): void {
        if (symbol && symbol.declarations) {
            const project = context.project;
            for (let d of symbol.declarations) {
                if (!d.symbol) {
                    continue;
                }
                const id = project.symbolMapping[context.getSymbolID(d.symbol)];
                if (!id) {
                    continue;
                }

                const reflection = project.reflections[id];
                if (reflection instanceof DeclarationReflection) {
                    const importedDeclaration = createDeclaration(context, node, reflection.kind, name);
                    if (importedDeclaration != null) {
                        importedDeclaration.importedFrom = reflection;
                    }
                    break;
                }
            }
        }
    }
}
