import * as ts from 'typescript';
import { Type } from '../../models/index';
import { ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';
export declare class ArrayConverter extends ConverterTypeComponent implements TypeConverter<ts.TypeReference, ts.ArrayTypeNode> {
    supportsNode(context: Context, node: ts.ArrayTypeNode): boolean;
    supportsType(context: Context, type: ts.TypeReference): boolean;
    convertNode(context: Context, node: ts.ArrayTypeNode): Type | undefined;
    convertType(context: Context, type: ts.TypeReference): Type | undefined;
}
