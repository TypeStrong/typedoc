import * as ts from "typescript";
import { Type } from "../../models/types/index";
import { ConverterTypeComponent, ITypeNodeConverter } from "../components";
import { Context } from "../context";
export declare class TypeParameterConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.TypeReferenceNode> {
    priority: number;
    supportsNode(context: Context, node: ts.TypeReferenceNode, type: ts.Type): boolean;
    convertNode(context: Context, node: ts.TypeReferenceNode): Type;
}
