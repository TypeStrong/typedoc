import * as ts from 'typescript';

import {Type, TupleType} from '../../models/index';
import {TypeConverter, NodeTypeConverter} from './type';
import {Context} from '../context';

export class BindingArrayConverter extends TypeConverter implements NodeTypeConverter {
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
        const types: Type[] = [];

        (node.elements as ts.BindingElement[]).forEach((element) => {
            types.push(this.converter.convertType(context, element));
        });

        return new TupleType(types);
    }
}
