import * as ts from "typescript";
import { Type } from "../../models/index";
import { ConverterTypeComponent, ITypeNodeConverter } from "../components";
import { Context } from "../context";
export declare class ArrayConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.ArrayTypeNode> {
    supportsNode(context: Context, node: ts.ArrayTypeNode): boolean;
    convertNode(context: Context, node: ts.ArrayTypeNode): Type;
}
