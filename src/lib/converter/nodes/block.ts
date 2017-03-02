import * as ts from 'typescript';

import {Reflection, ReflectionKind, ReflectionFlag} from '../../models/index';
import {createDeclaration} from '../factories/index';
import {Context} from '../context';
import {NodeConverter} from './node';
import {SourceFileMode} from '../converter';

const prefered: ts.SyntaxKind[] = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.EnumDeclaration
];

export class BlockConverter extends NodeConverter {

    /**
     * List of supported TypeScript syntax kinds.
     */
    static supports: ts.SyntaxKind[] = [
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
            this.convertSourceFile(context, <ts.SourceFile> node);
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
    private convertSourceFile(context: Context, node: ts.SourceFile): Reflection {
        let result = context.scope;

        context.withSourceFile(node, () => {
            if (this.converter.options.mode === SourceFileMode.Modules) {
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

    private convertStatements(context: Context, node: ts.SourceFile|ts.Block|ts.ModuleBlock) {
        if (node.statements) {
            const statements: ts.Statement[] = [];

            node.statements.forEach((statement) => {
                if (prefered.indexOf(statement.kind) !== -1) {
                    this.converter.convertNode(context, statement);
                } else {
                    statements.push(statement);
                }
            });

            statements.forEach((statement) => {
                this.converter.convertNode(context, statement);
            });
        }
    }
}
