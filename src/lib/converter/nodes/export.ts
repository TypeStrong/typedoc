import * as ts from "typescript";

import {Reflection, ReflectionKind, ReflectionFlag, DeclarationReflection} from "../../models/index";
import {Context} from "../context";
import {Component, ConverterNodeComponent} from "../components";


@Component({name:'node:export'})
export class ExportConverter extends ConverterNodeComponent<ts.ExportAssignment>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
        ts.SyntaxKind.ExportAssignment
    ];

    convert(context:Context, node:ts.ExportAssignment):Reflection {
        let symbol: ts.Symbol = undefined;

        // default export
        if (node.symbol && (node.symbol.flags & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias) {
            symbol = context.checker.getAliasedSymbol(node.symbol);
        } else {
            let type = context.getTypeAtLocation(node.expression);
            symbol = type ? type.symbol : undefined;
        }
        if (symbol) {
            var project = context.project;
            symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) return;
                var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id) return;

                var reflection = project.reflections[id];
                if (node.isExportEquals && reflection instanceof DeclarationReflection) {
                    (<DeclarationReflection>reflection).setFlag(ReflectionFlag.ExportAssignment, true);
                }
                markAsExported(reflection);
            });
        }

        function markAsExported(reflection:Reflection) {
            if (reflection instanceof DeclarationReflection) {
                (<DeclarationReflection>reflection).setFlag(ReflectionFlag.Exported, true);
            }

            reflection.traverse(markAsExported);
        }

        return context.scope;
    }
}
