import * as ts from "typescript";
import { ReferenceType } from "../../models/index";
import { ConverterTypeComponent, ITypeNodeConverter } from "../components";
import { Context } from "../context";
export declare class AliasConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.TypeReferenceNode> {
    priority: number;
    supportsNode(context: Context, node: ts.TypeReferenceNode, type: ts.Type): boolean;
    convertNode(context: Context, node: ts.TypeReferenceNode): ReferenceType;
}
