import * as ts from 'typescript';

import {Reflection, ReflectionKind} from '../../models/index';
import {createDeclaration} from '../factories/index';
import {Context} from '../context';
import {NodeConverter} from './node';

export class AliasConverter extends NodeConverter {
    /**
     * List of supported TypeScript syntax kinds.
     */
    static supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.TypeAliasDeclaration
    ];

    /**
     * Analyze the given type alias declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The type alias declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.TypeAliasDeclaration): Reflection {
        const alias = createDeclaration(context, node, ReflectionKind.TypeAlias);

        context.withScope(alias, () => {
            alias.type = this.converter.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });

        return alias;
    }
}
