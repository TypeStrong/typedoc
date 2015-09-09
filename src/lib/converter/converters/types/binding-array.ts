import * as ts from "typescript";

import {Context} from "../../Context";
import {Converter} from "../../Converter";
import {Type} from "../../../models/Type";
import {convertType, TypeNodeConverter} from "../type";
import {TupleType} from "../../../models/types/TupleType";


export class BindingArrayConverter implements TypeNodeConverter<ts.Type, ts.BindingPattern>
{
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:ts.BindingPattern):boolean {
        return node.kind === ts.SyntaxKind.ArrayBindingPattern;
    }


    /**
     * Convert the given binding pattern to its type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The binding pattern that should be converted.
     * @returns The type reflection representing the given binding pattern.
     */
    convertNode(context:Context, node:ts.BindingPattern):Type {
        var types:Type[] = [];

        node.elements.forEach((element) => {
            types.push(convertType(context, element));
        });

        return new TupleType(types);
    }
}
