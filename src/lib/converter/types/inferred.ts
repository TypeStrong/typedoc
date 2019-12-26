import * as ts from 'typescript';

import { InferredType } from '../../models/types';
import { Component, ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:inferred'})
export class InferredConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.InferTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(_context: Context, node: ts.TypeNode): boolean {
        return ts.isInferTypeNode(node);
    }

    /**
     * Convert the given conditional type node to its type reflection.
     *
     * This is a node based converter, see [[convertType]] for the type equivalent.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The conditional or intersection type node that should be converted.
     * @returns The type reflection representing the given conditional type node.
     */
    convertNode(context: Context, node: ts.InferTypeNode): InferredType | undefined {
        return new InferredType(node.typeParameter.getText());
    }
}
