import * as ts from 'typescript';

import { Type, TupleType } from '../../models/index';
import { Component, ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:binding-array'})
export class BindingArrayConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.BindingPattern> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.BindingPattern): boolean {
        return node.kind === ts.SyntaxKind.ArrayBindingPattern;
    }

    /**
     * Convert the given binding pattern to its type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The binding pattern that should be converted.
     * @returns The type reflection representing the given binding pattern.
     */
    convertNode(context: Context, node: ts.BindingPattern): Type {
        const types = this.owner.convertTypes(context, node.elements);
        return new TupleType(types);
    }
}
