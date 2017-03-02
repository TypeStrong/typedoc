import * as ts from 'typescript';

import {Reflection, ReflectionKind, DeclarationReflection} from '../../models/index';
import {createSignature} from '../factories/index';
import {Context} from '../context';
import {NodeConverter} from './node';

export class IndexSignatureConverter extends NodeConverter {
    /**
     * List of supported TypeScript syntax kinds.
     */
    static supports: ts.SyntaxKind[] = [
        ts.SyntaxKind.IndexSignature
    ];

    /**
     * Analyze the given index signature declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The signature declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    convert(context: Context, node: ts.SignatureDeclaration): Reflection {
        const scope = <DeclarationReflection> context.scope;
        if (scope instanceof DeclarationReflection) {
            scope.indexSignature = createSignature(context, node, '__index', ReflectionKind.IndexSignature);
        }

        return scope;
    }
}
