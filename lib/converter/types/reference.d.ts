import * as ts from "typescript";
import { Type } from "../../models/types/index";
import { ConverterTypeComponent, ITypeNodeConverter } from "../components";
import { Context } from "../context";
export declare class ReferenceConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.TypeReference, ts.TypeReferenceNode> {
    priority: number;
    supportsNode(context: Context, node: ts.TypeReferenceNode, type: ts.TypeReference): boolean;
    supportsType(context: Context, type: ts.TypeReference): boolean;
    convertNode(context: Context, node: ts.TypeReferenceNode, type: ts.TypeReference): Type;
    convertType(context: Context, type: ts.TypeReference): Type;
    private convertLiteral(context, symbol, node?);
}
