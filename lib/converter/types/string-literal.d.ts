import * as ts from "typescript";
import { Type } from "../../models/types/index";
import { ConverterTypeComponent, ITypeConverter } from "../components";
import { Context } from "../context";
export declare class StringLiteralConverter extends ConverterTypeComponent implements ITypeConverter<ts.LiteralType, ts.StringLiteral> {
    supportsNode(context: Context, node: ts.StringLiteral): boolean;
    supportsType(context: Context, type: ts.LiteralType): boolean;
    convertNode(context: Context, node: ts.StringLiteral): Type;
    convertType(context: Context, type: ts.LiteralType): Type;
}
