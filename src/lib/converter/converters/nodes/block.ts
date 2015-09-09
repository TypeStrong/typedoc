import * as ts from "typescript";

import {Context} from "../../Context";
import {SourceFileMode} from "../../Converter";
import {Reflection, ReflectionKind, ReflectionFlag} from "../../../models/Reflection";
import {convertNode, NodeConveter} from "../node";
import {createDeclaration} from "../factories/declaration";


var prefered:ts.SyntaxKind[] = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.EnumDeclaration
];


export class BlockConverter implements NodeConveter<ts.SourceFile|ts.Block|ts.ModuleBlock>
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[] = [
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
    convert(context:Context, node:ts.SourceFile|ts.Block|ts.ModuleBlock):Reflection {
        if (node.kind == ts.SyntaxKind.SourceFile) {
            this.convertSourceFile(context, <ts.SourceFile>node);
        } else {
            this.convertStatements(context, node);
        }

        return context.scope;
    }


    convertStatements(context:Context, node:ts.SourceFile|ts.Block|ts.ModuleBlock) {
        if (node.statements) {
            var statements:ts.Statement[] = [];

            node.statements.forEach((statement) => {
                if (prefered.indexOf(statement.kind) != -1) {
                    convertNode(context, statement);
                } else {
                    statements.push(statement);
                }
            });

            statements.forEach((statement) => {
                convertNode(context, statement);
            });
        }
    }


    /**
     * Analyze the given source file node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The source file node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convertSourceFile(context:Context, node:ts.SourceFile):Reflection {
        var result = context.scope;
        var options = context.getOptions();

        context.withSourceFile(node, () => {
            if (options.mode == SourceFileMode.Modules) {
                result = createDeclaration(context, node, ReflectionKind.ExternalModule, node.fileName);
                context.withScope(result, () => {
                    this.convertStatements(context, node);
                    result.setFlag(ReflectionFlag.Exported);
                });
            } else {
                this.convertStatements(context, node);
            }
        });

        return result;
    }
}
