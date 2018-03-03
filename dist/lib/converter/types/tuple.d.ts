import * as ts from 'typescript';
import { TupleType } from '../../models/types/index';
import { ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';
export declare class TupleConverter extends ConverterTypeComponent implements TypeConverter<ts.TypeReference, ts.TupleTypeNode> {
    supportsNode(context: Context, node: ts.TupleTypeNode): boolean;
    supportsType(context: Context, type: ts.TypeReference): boolean;
    convertNode(context: Context, node: ts.TupleTypeNode): TupleType;
    convertType(context: Context, type: ts.TypeReference): TupleType;
}
