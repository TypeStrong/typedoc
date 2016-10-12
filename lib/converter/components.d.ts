import * as ts from "typescript";
import { Component, AbstractComponent } from "../utils/component";
import { Reflection } from "../models/reflections/abstract";
import { Type } from "../models/types/abstract";
import { Context } from "./context";
import { Converter } from "./converter";
export { Component };
export declare abstract class ConverterComponent extends AbstractComponent<Converter> {
}
export declare abstract class ConverterNodeComponent<T extends ts.Node> extends ConverterComponent {
    supports: ts.SyntaxKind[];
    abstract convert(context: Context, node: T): Reflection;
}
export declare abstract class ConverterTypeComponent extends ConverterComponent {
    priority: number;
}
export interface ITypeConverter<T extends ts.Type, N extends ts.Node> extends ConverterTypeComponent, ITypeTypeConverter<T>, ITypeNodeConverter<T, N> {
}
export interface ITypeTypeConverter<T extends ts.Type> extends ConverterTypeComponent {
    supportsType(context: Context, type: T): boolean;
    convertType(context: Context, type: T): Type;
}
export interface ITypeNodeConverter<T extends ts.Type, N extends ts.Node> extends ConverterTypeComponent {
    supportsNode(context: Context, node: N, type: T): boolean;
    convertNode(context: Context, node: N, type: T): Type;
}
