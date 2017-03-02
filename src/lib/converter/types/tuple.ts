import * as ts from 'typescript';

import {Type, TupleType} from '../../models/types/index';
import {TypeConverter, NodeTypeConverter, TypeTypeConverter} from './type';
import {Context} from '../context';

export class TupleConverter extends TypeConverter implements NodeTypeConverter, TypeTypeConverter {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.TupleTypeNode): boolean {
        return node.kind === ts.SyntaxKind.TupleType;
    }

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.TypeReference): boolean {
        return !!(type.objectFlags & ts.ObjectFlags.Tuple);
    }

    /**
     * Convert the given tuple type node to its type reflection.
     *
     * This is a node based converter, see [[convertTupleType]] for the type equivalent.
     *
     * ```
     * let someValue: [string,number];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The tuple type node that should be converted.
     * @returns The type reflection representing the given tuple type node.
     */
    convertNode(context: Context, node: ts.TupleTypeNode): TupleType {
        let elements: Type[];
        if (node.elementTypes) {
            elements = node.elementTypes.map((n) => this.converter.convertType(context, n));
        } else {
            elements = [];
        }

        return new TupleType(elements);
    }

    /**
     * Convert the given tuple type to its type reflection.
     *
     * This is a type based converter, see [[convertTupleTypeNode]] for the node equivalent.
     *
     * ```
     * let someValue: [string,number];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The tuple type that should be converted.
     * @returns The type reflection representing the given tuple type.
     */
    convertType(context: Context, type: ts.TypeReference): TupleType {
        let elements: Type[];
        if (type.typeArguments) {
            elements = type.typeArguments.map((t) => this.converter.convertType(context, null, t));
        } else {
            elements = [];
        }

        return new TupleType(elements);
    }
}
