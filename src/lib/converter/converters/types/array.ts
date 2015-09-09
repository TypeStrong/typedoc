import * as ts from "typescript";

import {Context} from "../../Context";
import {Type} from "../../../models/Type";
import {IntrinsicType} from "../../../models/types/IntrinsicType";
import {TypeNodeConverter, convertType} from "../type";


export class ArrayConverter implements TypeNodeConverter<ts.Type, ts.ArrayTypeNode>
{
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:ts.ArrayTypeNode):boolean {
        return node.kind === ts.SyntaxKind.ArrayType;
    }


    /**
     * Convert the given array type node to its type reflection.
     *
     * This is a node based converter with no type equivalent.
     *
     * ```
     * var someValue:number[];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The array type node that should be converted.
     * @returns The type reflection representing the given array type node.
     */
    convertNode(context:Context, node:ts.ArrayTypeNode):Type {
        var result = convertType(context, node.elementType);

        if (result) {
            result.isArray = true;
        } else {
            result = new IntrinsicType('Array');
        }

        return result;
    }
}
