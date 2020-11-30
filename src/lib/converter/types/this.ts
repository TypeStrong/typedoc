import * as ts from "typescript";

import { Type, IntrinsicType } from "../../models/types/index";
import {
    Component,
    ConverterTypeComponent,
    TypeNodeConverter,
} from "../components";
import { Context } from "../context";

@Component({ name: "type:this" })
export class ThisConverter
    extends ConverterTypeComponent
    implements TypeNodeConverter<ts.Type, ts.ThisTypeNode> {
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    public supportsNode(context: Context, node: ts.ThisTypeNode): boolean {
        return node.kind === ts.SyntaxKind.ThisType;
    }

    /**
     * Convert the type reference node to its type reflection.
     *
     * This is a node based converter, see [[convertTypeReferenceType]] for the type equivalent.
     *
     * ```
     * class SomeClass { }
     * const someValue:SomeClass;
     * ```
     *
     * @returns The type reflection representing the given reference node.
     */
    public convertNode(): Type {
        return new IntrinsicType("this");
    }
}
