import * as ts from 'typescript';

import { Type, UnionType, IntersectionType } from '../../models/types/index';
import { Component, ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';

@Component({name: 'type:union-or-intersection'})
export class UnionOrIntersectionConverter extends ConverterTypeComponent implements TypeConverter<ts.UnionOrIntersectionType, ts.UnionOrIntersectionTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context: Context, node: ts.UnionOrIntersectionTypeNode): boolean {
        return node.kind === ts.SyntaxKind.UnionType || node.kind === ts.SyntaxKind.IntersectionType;
    }

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context: Context, type: ts.UnionOrIntersectionType): boolean {
        return !!(type.flags & ts.TypeFlags.UnionOrIntersection) && !(type.flags & ts.TypeFlags.EnumLiteral);
    }

    /**
     * Convert the given union type node to its type reflection.
     *
     * This is a node based converter, see [[convertType]] for the type equivalent.
     *
     * ```
     * let someValue: string|number;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The union or intersection type node that should be converted.
     * @returns The type reflection representing the given union type node.
     */
    convertNode(context: Context, node: ts.UnionOrIntersectionTypeNode): UnionType | IntersectionType {
        const types: Type[] = this.owner.convertTypes(context, node.types);

        return ts.isIntersectionTypeNode(node) ? new IntersectionType(types) : new UnionType(types);
    }

    /**
     * Convert the given union type to its type reflection.
     *
     * This is a type based converter, see [[convertUnionTypeNode]] for the node equivalent.
     *
     * ```
     * let someValue: string|number;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The union type that should be converted.
     * @returns The type reflection representing the given union type.
     */
    convertType(context: Context, type: ts.UnionOrIntersectionType): UnionType | IntersectionType {
        const types: Type[] = this.owner.convertTypes(context, undefined, type.types);
        return type.flags & ts.TypeFlags.Intersection ? new IntersectionType(types) : new UnionType(types);
    }
}
