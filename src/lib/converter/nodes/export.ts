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
        if (!node.isExportEquals) {
            return context.scope;
        }

        var type = context.getTypeAtLocation(node.expression);
        if (type && type.symbol) {
            var project = context.project;
            type.symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) return;
                var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id) return;

                var reflection = project.reflections[id];
                if (reflection instanceof DeclarationReflection) {
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
