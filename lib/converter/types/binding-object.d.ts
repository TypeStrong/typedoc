import * as ts from "typescript";
import { Type } from "../../models/index";
import { ConverterTypeComponent, ITypeNodeConverter } from "../components";
import { Context } from "../context";
export declare class BindingObjectConverter extends ConverterTypeComponent implements ITypeNodeConverter<ts.Type, ts.BindingPattern> {
    supportsNode(context: Context, node: ts.BindingPattern): boolean;
    convertNode(context: Context, node: ts.BindingPattern): Type;
}
