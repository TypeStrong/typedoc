import * as ts from 'typescript';
import { IntrinsicType } from '../../models/index';
import { ConverterTypeComponent, TypeTypeConverter } from '../components';
import { Context } from '../context';
export declare class IntrinsicConverter extends ConverterTypeComponent implements TypeTypeConverter<ts.Type> {
    supportsType(context: Context, type: ts.Type): boolean;
    convertType(context: Context, type: ts.Type): IntrinsicType;
}
