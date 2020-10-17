import * as ts from "typescript";

import {
    Reflection,
    ReflectionFlag,
    DeclarationReflection,
    ContainerReflection,
} from "../../models/index";
import { Context } from "../context";
import { Component, ConverterNodeComponent } from "../components";
import { createReferenceOrDeclarationReflection } from "../factories/reference";

@Component({ name: "node:export" })
export class ExportConverter extends ConverterNodeComponent<
    ts.ExportAssignment
> {
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports: ts.SyntaxKind[] = [ts.SyntaxKind.ExportAssignment];

    convert(context: Context, node: ts.ExportAssignment): Reflection {
        let symbol: ts.Symbol | undefined;

        // default export
        if (
            node.symbol &&
            (node.symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias
        ) {
            symbol = context.checker.getAliasedSymbol(node.symbol);
        } else {
            const type = context.getTypeAtLocation(node.expression);
            symbol = type ? type.symbol : undefined;
        }
        if (symbol && symbol.declarations) {
            const project = context.project;
            symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) {
                    return;
                }

                const reflection = project.getReflectionFromFQN(
                    context.checker.getFullyQualifiedName(declaration.symbol)
                );
                if (
                    node.isExportEquals &&
                    reflection instanceof DeclarationReflection
                ) {
                    reflection.setFlag(ReflectionFlag.ExportAssignment, true);
                }
            });
        }

        return context.scope;
    }
}

@Component({ name: "node:export-declaration" })
export class ExportDeclarationConverter extends ConverterNodeComponent<
    ts.ExportDeclaration
> {
    supports = [ts.SyntaxKind.ExportDeclaration];

    convert(
        context: Context,
        node: ts.ExportDeclaration
    ): Reflection | undefined {
        const withinNamespace = node.parent.kind === ts.SyntaxKind.ModuleBlock;

        const scope = context.scope;
        if (!(scope instanceof ContainerReflection)) {
            throw new Error("Expected to be within a container");
        }

        if (
            node.exportClause &&
            node.exportClause.kind === ts.SyntaxKind.NamedExports
        ) {
            // export { a, a as b }
            node.exportClause.elements.forEach((specifier) => {
                const source = context.expectSymbolAtLocation(specifier.name);
                const target = context.resolveAliasedSymbol(
                    context.expectSymbolAtLocation(
                        specifier.propertyName ?? specifier.name
                    )
                );
                // If the original declaration is in this file, export {} was used with something
                // defined in this file and we don't need to create a reference unless the name is different.
                if (
                    !node.moduleSpecifier &&
                    !specifier.propertyName &&
                    !withinNamespace
                ) {
                    return;
                }

                createReferenceOrDeclarationReflection(context, source, target);
            });
        } else if (
            node.exportClause &&
            node.exportClause.kind === ts.SyntaxKind.NamespaceExport
        ) {
            // export * as ns from ...
            const source = context.expectSymbolAtLocation(
                node.exportClause.name
            );
            if (!node.moduleSpecifier) {
                throw new Error(
                    "Namespace export is missing a module specifier."
                );
            }
            const target = context.resolveAliasedSymbol(
                context.expectSymbolAtLocation(node.moduleSpecifier)
            );
            createReferenceOrDeclarationReflection(context, source, target);
        } else if (node.moduleSpecifier) {
            // export * from ...
            const sourceFileSymbol = context.expectSymbolAtLocation(
                node.moduleSpecifier
            );
            for (const symbol of context.checker.getExportsOfModule(
                sourceFileSymbol
            )) {
                if (symbol.name === "default") {
                    // Default exports are not re-exported with export *
                    continue;
                }
                createReferenceOrDeclarationReflection(
                    context,
                    symbol,
                    context.resolveAliasedSymbol(symbol)
                );
            }
        }

        return context.scope;
    }
}

@Component({ name: "node:export-specifier" })
export class ExportSpecifierConverter extends ConverterNodeComponent<
    ts.ExportSpecifier
> {
    supports = [ts.SyntaxKind.ExportSpecifier];

    convert(
        context: Context,
        node: ts.ExportSpecifier
    ): Reflection | undefined {
        const source = context.expectSymbolAtLocation(node.name);
        const target = context.resolveAliasedSymbol(
            context.expectSymbolAtLocation(node.propertyName ?? node.name)
        );

        return createReferenceOrDeclarationReflection(context, source, target);
    }
}

@Component({ name: "node:namespace-export" })
export class NamespaceExportConverter extends ConverterNodeComponent<
    ts.NamespaceExport
> {
    supports = [ts.SyntaxKind.NamespaceExport];

    convert(
        context: Context,
        node: ts.NamespaceExport
    ): Reflection | undefined {
        const source = context.expectSymbolAtLocation(node.name);
        const target = context.resolveAliasedSymbol(source);

        return createReferenceOrDeclarationReflection(context, source, target);
    }
}
