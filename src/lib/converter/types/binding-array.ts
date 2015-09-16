import * as ts from "typescript";

import {Type, TupleType} from "../../models/index";
import {Component, ConverterTypeComponent, ITypeNodeConverter} from "../components";
import {Context} from "../context";


@Component({name:'type:binding-array'})
export class BindingArrayConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.BindingPattern>
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
            types.push(this.owner.convertType(context, element));
        });

        return new TupleType(types);
    }
}
