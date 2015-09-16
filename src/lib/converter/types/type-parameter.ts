import * as ts from "typescript";

import {Type, TypeParameterType} from "../../models/types/index";
import {Component, ConverterTypeComponent, ITypeNodeConverter} from "../components";
import {Context} from "../context";


@Component({name:'type:type-parameter'})
export class TypeParameterConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.TypeReferenceNode>
{
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority:number = -50;



    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:ts.TypeReferenceNode, type:ts.Type):boolean {
        return !!(type.flags & ts.TypeFlags.TypeParameter);
    }


    /**
     * Interpret the given type reference node as a type parameter and convert it to its type reflection.
     *
     * This is a node based converter with no type equivalent.
     *
     * ```
     * class SomeClass<T> {
     *   public someValue:T;
     * }
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The type reference node representing a type parameter.
     * @returns The type reflection representing the given type parameter.
     */
    convertNode(context:Context, node:ts.TypeReferenceNode):Type {
        if (node.typeName) {
            var name = ts.getTextOfNode(node.typeName);
            if (context.typeParameters && context.typeParameters[name]) {
                return context.typeParameters[name].clone();
            }

            var result = new TypeParameterType();
            result.name = name;
            return result;
        }
    }
}
