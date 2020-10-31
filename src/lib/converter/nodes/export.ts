import * as ts from "typescript";
import * as assert from "assert";

import {
    ContainerReflection,
    DeclarationReflection,
    Reflection,
    ReflectionKind,
} from "../../models/index";
import { Context } from "../context";
import { Component, ConverterNodeComponent } from "../components";
import { createReferenceOrDeclarationReflection } from "../factories/reference";

// Either a default export or export=
@Component({ name: "node:export-assignment" })
export class ExportConverter extends ConverterNodeComponent<
    ts.ExportAssignment
> {
    supports: ts.SyntaxKind[] = [ts.SyntaxKind.ExportAssignment];

    convert(
        context: Context,
        node: ts.ExportAssignment
    ): Reflection | undefined {
        assert(context.scope instanceof ContainerReflection);
        const name = node.isExportEquals ? "export =" : "default";

        // We might not have a symbol if someone does `export default 1`
        const expressionSymbol = context.getSymbolAtLocation(node.expression);

        if (expressionSymbol) {
            const reflection = createReferenceOrDeclarationReflection(
                context,
                expressionSymbol,
                context.resolveAliasedSymbol(expressionSymbol)
            );

            if (reflection) {
                reflection.name = name;
            }

            return reflection;
        } else {
            // We can't use createDeclaration because it expects a ts.Declaration, which we don't have.
            const reflection = new DeclarationReflection(
                name,
                ReflectionKind.Variable,
                context.scope
            );

            const exportSymbol =
                node.symbol ?? context.expectSymbolAtLocation(node);
            reflection.type = this.owner.convertType(
                context,
                context.checker.getTypeOfSymbolAtLocation(exportSymbol, node)
            );

            context.scope.children ??= [];
            context.scope.children.push(reflection);

            return reflection;
        }
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
