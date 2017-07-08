import * as ts from 'typescript';

import { Type, TupleType } from '../../models/types/index';
import { Component, ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:tuple'})
export class TupleConverter extends ConverterTypeComponent implements TypeConverter<ts.TypeReference, ts.TupleTypeNode> {
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
            elements = node.elementTypes.map((n) => this.owner.convertType(context, n));
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
            elements = type.typeArguments.map((t) => this.owner.convertType(context, null, t));
        } else {
            elements = [];
        }

        return new TupleType(elements);
    }
}
