import * as ts from 'typescript';
import { Type } from '../../models/types/index';
import { ConverterTypeComponent, TypeTypeConverter } from '../components';
import { Context } from '../context';
export declare class UnknownConverter extends ConverterTypeComponent implements TypeTypeConverter<ts.Type> {
    priority: number;
    supportsType(context: Context, type: ts.Type): boolean;
    convertType(context: Context, type: ts.Type): Type;
}
