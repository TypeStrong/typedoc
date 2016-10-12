import * as ts from "typescript";
import { Type } from "../../models/index";
import { ConverterTypeComponent, ITypeTypeConverter } from "../components";
import { Context } from "../context";
export declare class EnumConverter extends ConverterTypeComponent implements ITypeTypeConverter<ts.Type> {
    supportsType(context: Context, type: ts.Type): boolean;
    convertType(context: Context, type: ts.Type): Type;
}
