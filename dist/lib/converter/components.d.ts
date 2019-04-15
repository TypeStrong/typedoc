import * as ts from 'typescript';
import { Component, AbstractComponent } from '../utils/component';
import { Reflection } from '../models/reflections/abstract';
import { Type } from '../models/types/abstract';
import { Context } from './context';
import { Converter } from './converter';
export { Component };
export declare abstract class ConverterComponent extends AbstractComponent<Converter> {
}
export declare abstract class ConverterNodeComponent<T extends ts.Node> extends ConverterComponent {
    abstract supports: ts.SyntaxKind[];
    abstract convert(context: Context, node: T): Reflection | undefined;
}
export declare abstract class ConverterTypeComponent extends ConverterComponent {
    priority: number;
}
export interface TypeConverter<T extends ts.Type, N extends ts.Node> extends ConverterTypeComponent, TypeTypeConverter<T>, TypeNodeConverter<T, N> {
}
export interface TypeTypeConverter<T extends ts.Type> extends ConverterTypeComponent {
    supportsType(context: Context, type: T): boolean;
    convertType(context: Context, type: T): Type | undefined;
}
export interface TypeNodeConverter<T extends ts.Type, N extends ts.Node> extends ConverterTypeComponent {
    supportsNode(context: Context, node: N, type: T | undefined): boolean;
    convertNode(context: Context, node: N, type: T | undefined): Type | undefined;
}
