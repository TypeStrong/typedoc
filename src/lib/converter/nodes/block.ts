import * as ts from "typescript";

import { Reflection, ReflectionKind } from "../../models/index";
import { createDeclaration } from "../factories/index";
import { Context } from "../context";
import { Component, ConverterNodeComponent } from "../components";
import { Converter } from "..";
import { getCommonDirectory } from "../../utils/fs";
import { relative, resolve } from "path";

@Component({ name: "node:block" })
export class BlockConverter extends ConverterNodeComponent<
    ts.SourceFile | ts.ModuleBlock
> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ModuleBlock,
        ts.SyntaxKind.SourceFile,
    ];

    // Created in initialize
    private entryPoints!: string[];
    private baseDir!: string;

    initialize() {
        super.initialize();
        this.owner.on(Converter.EVENT_BEGIN, () => {
            this.entryPoints = this.application.options
                .getValue("entryPoints")
                .map((path) => this.normalizeFileName(resolve(path)));
            this.baseDir = getCommonDirectory(this.entryPoints);
        });
    }

    /**
     * Analyze the given class declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The class declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(
        context: Context,
        node: ts.SourceFile | ts.ModuleBlock
    ): Reflection | undefined {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            return this.convertSourceFile(context, node);
        } else {
            for (const exp of this.getExports(context, node)) {
                for (const decl of exp.getDeclarations() ?? []) {
                    this.owner.convertNode(context, decl);
                }
            }
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
    private convertSourceFile(
        context: Context,
        node: ts.SourceFile
    ): Reflection | undefined {
        let result: Reflection | undefined = context.scope;

        context.withSourceFile(node, () => {
            if (this.isEntryPoint(node.fileName)) {
                const symbol =
                    context.checker.getSymbolAtLocation(node) ?? node.symbol;

                if (context.inFirstPass) {
                    if (this.entryPoints.length === 1) {
                        result = context.project;
                        context.project.registerReflection(result, symbol);
                    } else {
                        result = createDeclaration(
                            context,
                            node,
                            ReflectionKind.Module,
                            this.getModuleName(node.fileName)
                        );
                    }
                    context.withScope(result, () => {
                        this.convertExports(context, node);
                    });
                } else if (symbol) {
                    result = context.project.getReflectionFromSymbol(symbol);

                    context.withScope(result, () => {
                        this.convertReExports(context, node);
                    });
                }
            } else {
                result = createDeclaration(
                    context,
                    node,
                    ReflectionKind.Namespace,
                    this.getModuleName(node.fileName)
                );
                context.withScope(result, () => {
                    this.convertExports(context, node);
                });
            }
        });

        return result;
    }

    private convertExports(
        context: Context,
        node: ts.SourceFile | ts.ModuleBlock
    ) {
        // We really need to rebuild the converters to work on a symbol basis rather than a node
        // basis... this relies on us getting declaration merging right, which is dangerous at best
        for (const exp of this.getExports(context, node).filter((exp) =>
            context
                .resolveAliasedSymbol(exp)
                .getDeclarations()
                ?.every((d) => d.getSourceFile() === node.getSourceFile())
        )) {
            for (const decl of exp.getDeclarations() ?? []) {
                this.owner.convertNode(context, decl);
            }
        }
    }

    private convertReExports(
        context: Context,
        node: ts.SourceFile | ts.ModuleBlock
    ) {
        for (const exp of this.getExports(context, node).filter((exp) =>
            context
                .resolveAliasedSymbol(exp)
                .getDeclarations()
                ?.some((d) => d.getSourceFile() !== node.getSourceFile())
        )) {
            for (const decl of exp.getDeclarations() ?? []) {
                this.owner.convertNode(context, decl);
            }
        }
    }

    private getExports(
        context: Context,
        node: ts.SourceFile | ts.ModuleBlock
    ): ts.Symbol[] {
        let symbol = context.checker.getSymbolAtLocation(node) ?? node.symbol;
        if (!symbol && ts.isModuleBlock(node)) {
            symbol = context.checker.getSymbolAtLocation(node.parent.name);
        }

        // The generated docs aren't great, but you really ought not be using
        // this in the first place... so it's better than nothing.
        const exportEq = symbol?.exports?.get("export=" as ts.__String);
        if (exportEq) {
            return [exportEq];
        }

        if (symbol) {
            return context.checker.getExportsOfModule(symbol);
        }

        // This is a global file, get all symbols declared in this file...
        // this isn't the best solution, it would be nice to have all globals given to a special
        // "globals" file, but this is uncommon enough that I'm skipping it for now.
        const sourceFile = node.getSourceFile();
        return context.checker
            .getSymbolsInScope(node, ts.SymbolFlags.Type | ts.SymbolFlags.Value)
            .filter((s) =>
                s
                    .getDeclarations()
                    ?.some((d) => d.getSourceFile() === sourceFile)
            );
    }

    private getModuleName(fileName: string) {
        return this.normalizeFileName(relative(this.baseDir, fileName)).replace(
            /(\.d)?\.[tj]sx?$/,
            ""
        );
    }

    private isEntryPoint(fileName: string) {
        return this.entryPoints.includes(fileName);
    }

    private normalizeFileName(fileName: string) {
        return fileName.replace(/\\/g, "/");
    }
}
