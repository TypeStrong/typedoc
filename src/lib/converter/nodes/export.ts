import * as ts from "typescript";

import {
    Reflection,
    ReflectionFlag,
    DeclarationReflection,
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

                const reflection = project.getReflectionFromSymbol(
                    declaration.symbol
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
