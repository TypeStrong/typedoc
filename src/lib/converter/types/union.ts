import * as ts from "typescript";

import {Type, UnionType} from "../../models/types/index";
import {Context} from "../context";
import {convertType, TypeConverter} from "../convert-type";


export class UnionConverter implements TypeConverter<ts.UnionType, ts.UnionTypeNode>
{
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:ts.UnionTypeNode):boolean {
        return node.kind === ts.SyntaxKind.UnionType;
    }


    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context:Context, type:ts.UnionType):boolean {
        return !!(type.flags & ts.TypeFlags.Union);
    }


    /**
     * Convert the given union type node to its type reflection.
     *
     * This is a node based converter, see [[convertUnionType]] for the type equivalent.
     *
     * ```
     * var someValue:string|number;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The union type node that should be converted.
     * @returns The type reflection representing the given union type node.
     */
    convertNode(context:Context, node:ts.UnionTypeNode):UnionType {
        var types:Type[] = [];
        if (node.types) {
            types = node.types.map((n) => convertType(context, n));
        } else {
            types = [];
        }

        return new UnionType(types);
    }


    /**
     * Convert the given union type to its type reflection.
     *
     * This is a type based converter, see [[convertUnionTypeNode]] for the node equivalent.
     *
     * ```
     * var someValue:string|number;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The union type that should be converted.
     * @returns The type reflection representing the given union type.
     */
    convertType(context:Context, type:ts.UnionType):UnionType {
        var types:Type[];
        if (type && type.types) {
            types = type.types.map((t) => convertType(context, null, t));
        } else {
            types = [];
        }

        return new UnionType(types);
    }
}
