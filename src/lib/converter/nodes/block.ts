import * as ts from 'typescript';
import { resolve } from 'path';

import { Reflection, ReflectionKind, ReflectionFlag } from '../../models/index';
import { createDeclaration, createReferenceReflection } from '../factories/index';
import { Context } from '../context';
import { Component, ConverterNodeComponent } from '../components';
import { BindOption, SourceFileMode } from '../../utils';

const preferred: ts.SyntaxKind[] = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.EnumDeclaration
];

@Component({name: 'node:block'})
export class BlockConverter extends ConverterNodeComponent<ts.SourceFile|ts.Block|ts.ModuleBlock> {
    @BindOption('mode')
    mode!: SourceFileMode;

    @BindOption('inputFiles')
    inputFiles!: string[];

    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.Block,
        ts.SyntaxKind.ModuleBlock,
        ts.SyntaxKind.SourceFile
    ];

    /**
     * Analyze the given class declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The class declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.SourceFile|ts.Block|ts.ModuleBlock): Reflection {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            this.convertSourceFile(context, node);
        } else {
            this.convertStatements(context, node);
        }

        return context.scope;
    }

    /**
     * Analyze the given source file node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The source file node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    private convertSourceFile(context: Context, node: ts.SourceFile): Reflection | undefined {
        let result: Reflection | undefined = context.scope;

        const inputFiles = this.inputFiles.map(file => resolve(file).replace(/\\/g, '/'));
        const isInputFile = (node: ts.SourceFile) => inputFiles.includes(node.fileName);

        context.withSourceFile(node, () => {
            if (this.mode === SourceFileMode.Modules) {
                result = createDeclaration(context, node, ReflectionKind.Module, node.fileName);
                context.withScope(result, () => {
                    this.convertStatements(context, node);
                    result!.setFlag(ReflectionFlag.Exported);
                });
            } else if (this.mode === SourceFileMode.Library) {
                if (inputFiles.length > 1 || !isInputFile(node)) {
                    result = createDeclaration(context, node, ReflectionKind.Module, node.fileName);
                    context.withScope(result, () => {
                        this.convertVisibleDeclarations(context, node);
                        result!.setFlag(ReflectionFlag.Exported);
                    });
                } else {
                    this.convertVisibleDeclarations(context, node);
                }
            } else {
                this.convertStatements(context, node);
            }
        });

        return result;
    }

    private convertStatements(context: Context, node: ts.SourceFile|ts.Block|ts.ModuleBlock) {
        if (node.statements) {
            const statements: ts.Statement[] = [];

            node.statements.forEach((statement) => {
                if (preferred.includes(statement.kind)) {
                    this.owner.convertNode(context, statement);
                } else {
                    statements.push(statement);
                }
            });

            statements.forEach((statement) => {
                this.owner.convertNode(context, statement);
            });
        }
    }

    private convertVisibleDeclarations(context: Context, node: ts.SourceFile) {
        const moduleSymbol = context.getSymbolAtLocation(node);
        if (!moduleSymbol) {
            this.application.logger.warn(`File ${node.fileName} is not a module and cannot be converted in library mode`);
            return;
        }

        for (const symbol of context.checker.getExportsOfModule(moduleSymbol)) {
            const resolved = context.resolveAliasedSymbol(symbol);

            // export declaration is always unique: no need of loop
            const declaration = resolved?.declarations?.[0];
            if (declaration) {
                const declarationReflection = this.owner.convertNode(context, declaration);
                if (declarationReflection) {
                    if (!declarationReflection.kindOf([ReflectionKind.ClassOrInterface, ReflectionKind.SomeModule])) {
                        // rename the declaration to the exported one
                        declarationReflection.name = symbol.name;
                        declarationReflection.flags.setFlag(ReflectionFlag.Exported, true);
                    } else if (declarationReflection.name !== symbol.name) {
                        // create a extra reference to the declaration
                        declarationReflection.flags.setFlag(ReflectionFlag.Exported, false);
                        createReferenceReflection(context, symbol, resolved);
                    }

                    declarationReflection.flags.setFlag(ReflectionFlag.External, false);
                }
            }
        }
    }
}
