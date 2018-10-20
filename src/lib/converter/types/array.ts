import * as ts from 'typescript';

import { Type, ArrayType } from '../../models/index';
import { Component, ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:array'})
export class ArrayConverter extends ConverterTypeComponent implements TypeConverter<ts.TypeReference, ts.ArrayTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.ArrayTypeNode): boolean {
        return node.kind === ts.SyntaxKind.ArrayType;
    }

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.TypeReference): boolean {
        // Is there a better way to detect the {"type":"reference","name":"Array","typeArguments":{...}} types that are in fact arrays?
        return !!(type.flags & ts.TypeFlags.Object)
          && !!type.symbol
          && type.symbol.name === 'Array'
          && !type.symbol.parent
          && !!type.typeArguments
          && type.typeArguments.length === 1;
    }

    /**
     * Convert the given array type node to its type reflection.
     *
     * This is a node based converter with no type equivalent.
     *
     * ```
     * let someValue: number[];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The array type node that should be converted.
     * @returns The type reflection representing the given array type node.
     */
    convertNode(context: Context, node: ts.ArrayTypeNode): Type | undefined {
        const result = this.owner.convertType(context, node.elementType);
        if (result) {
            return new ArrayType(result);
        }
    }

    /**
     * Convert the given type reference to its type reflection.
     *
     * This is a type based converter, see [[convertTypeReference]] for the node equivalent.
     *
     * ```
     * class SomeClass { }
     * let someValue: SomeClass;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The type reference that should be converted.
     * @returns The type reflection representing the given type reference.
     */
    convertType(context: Context, type: ts.TypeReference): Type | undefined {
        const result = this.owner.convertType(context, undefined, type.typeArguments && type.typeArguments[0]);
        if (result) {
            return new ArrayType(result);
        }
    }
}
