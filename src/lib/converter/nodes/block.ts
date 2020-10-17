import * as ts from "typescript";

import { Reflection, ReflectionKind } from "../../models/index";
import { createDeclaration } from "../factories/index";
import { Context } from "../context";
import { Component, ConverterNodeComponent } from "../components";

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
    ): Reflection {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            this.convertSourceFile(context, node);
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
            console.log(
                node.fileName,
                this.getExports(context, node).map((n) => n.name)
            );

            if (context.inFirstPass) {
                result = createDeclaration(
                    context,
                    node,
                    ReflectionKind.Module,
                    node.fileName
                );
                context.withScope(result, () => {
                    this.convertExports(context, node);
                });
            } else {
                const symbol =
                    context.checker.getSymbolAtLocation(node) ?? node.symbol;

                if (symbol) {
                    result = context.project.getReflectionFromFQN(
                        context.checker.getFullyQualifiedName(symbol)
                    );

                    context.withScope(result, () => {
                        this.convertReExports(context, node);
                    });
                }
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
        for (const exp of this.getExports(context, node).filter(
            (exp) => context.resolveAliasedSymbol(exp) === exp
        )) {
            console.log("\tEXP", exp.name);
            for (const decl of exp.getDeclarations() ?? []) {
                this.owner.convertNode(context, decl);
            }
        }
    }

    private convertReExports(
        context: Context,
        node: ts.SourceFile | ts.ModuleBlock
    ) {
        for (const exp of this.getExports(context, node).filter(
            (exp) => context.resolveAliasedSymbol(exp) !== exp
        )) {
            console.log(
                "\tREEXP",
                exp.name,
                exp.getDeclarations()?.map((d) => ts.SyntaxKind[d.kind])
            );
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
}
