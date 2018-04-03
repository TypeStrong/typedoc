import * as ts from 'typescript';

import { Type, IntrinsicType } from '../../models/types/index';
import { Component, ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';

@Component({ name: 'type:this' })
export class ThisConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.ThisTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    public supportsNode(context: Context, node: ts.ThisTypeNode, type: ts.Type): boolean {
        return node.kind === ts.SyntaxKind.ThisType;
    }

    /**
     * Convert the type reference node to its type reflection.
     *
     * This is a node based converter, see [[convertTypeReferenceType]] for the type equivalent.
     *
     * ```
     * class SomeClass { }
     * var someValue:SomeClass;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The type reference node that should be converted.
     * @param type  The type of the type reference node.
     * @returns The type reflection representing the given reference node.
     */
    public convertNode(context: Context, node: ts.ThisTypeNode, type: ts.Type): Type {
        return new IntrinsicType('this');
    }
}
