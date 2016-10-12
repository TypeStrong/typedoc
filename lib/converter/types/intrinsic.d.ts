import * as ts from "typescript";
import { IntrinsicType } from "../../models/index";
import { ConverterTypeComponent, ITypeTypeConverter } from "../components";
import { Context } from "../context";
export declare class IntrinsicConverter extends ConverterTypeComponent implements ITypeTypeConverter<ts.IntrinsicType> {
    supportsType(context: Context, type: ts.IntrinsicType): boolean;
    convertType(context: Context, type: ts.IntrinsicType): IntrinsicType;
}
