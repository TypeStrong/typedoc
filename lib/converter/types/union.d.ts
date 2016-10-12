import * as ts from "typescript";
import { UnionType } from "../../models/types/index";
import { ConverterTypeComponent, ITypeConverter } from "../components";
import { Context } from "../context";
export declare class UnionConverter extends ConverterTypeComponent implements ITypeConverter<ts.UnionType, ts.UnionTypeNode> {
    supportsNode(context: Context, node: ts.UnionTypeNode): boolean;
    supportsType(context: Context, type: ts.UnionType): boolean;
    convertNode(context: Context, node: ts.UnionTypeNode): UnionType;
    convertType(context: Context, type: ts.UnionType): UnionType;
}
