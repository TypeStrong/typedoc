import * as ts from "typescript";
import { Type } from "../../models/types/index";
import { ConverterTypeComponent, ITypeTypeConverter } from "../components";
import { Context } from "../context";
export declare class UnknownConverter extends ConverterTypeComponent implements ITypeTypeConverter<ts.Type> {
    priority: number;
    supportsType(context: Context, type: ts.Type): boolean;
    convertType(context: Context, type: ts.Type): Type;
}
