import * as ts from 'typescript';

import {Reflection} from '../../models/index';
import {Context} from '../context';
import {NodeConverter} from './node';

export class ObjectLiteralConverter extends NodeConverter {
    /**
     * List of supported TypeScript syntax kinds.
     */
    static supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.ObjectLiteralExpression
    ];

    /**
     * Analyze the given object literal node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The object literal node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.ObjectLiteralExpression): Reflection {
        if (node.properties) {
            node.properties.forEach((node) => {
                this.converter.convertNode(context, node);
            });
        }

        return context.scope;
    }
}
