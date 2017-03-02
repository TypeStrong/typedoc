import * as ts from 'typescript';

import {Type, StringLiteralType} from '../../models/types/index';
import {TypeConverter, NodeTypeConverter, TypeTypeConverter} from './type';
import {Context} from '../context';

export class StringLiteralConverter extends TypeConverter implements NodeTypeConverter, TypeTypeConverter {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.StringLiteral): boolean {
        return node.kind === ts.SyntaxKind.StringLiteral;
    }

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.LiteralType): boolean {
        return !!(type.flags & ts.TypeFlags.StringLiteral);
    }

    /**
     * Convert the given string literal expression node to its type reflection.
     *
     * This is a node based converter, see [[convertStringLiteralType]] for the type equivalent.
     *
     * ```
     * createElement(tagName: "a"): HTMLAnchorElement;
     * ```
     *
     * @param node  The string literal node that should be converted.
     * @returns The type reflection representing the given string literal node.
     */
    convertNode(context: Context, node: ts.StringLiteral): Type {
        return new StringLiteralType(node.text);
    }

    /**
     * Convert the given string literal type to its type reflection.
     *
     * This is a type based converter, see [[convertStringLiteralExpression]] for the node equivalent.
     *
     * ```
     * createElement(tagName: "a"): HTMLAnchorElement;
     * ```
     *
     * @param type  The intrinsic type that should be converted.
     * @returns The type reflection representing the given string literal type.
     */
    convertType(context: Context, type: ts.LiteralType): Type {
        return new StringLiteralType(type.text);
    }
}
