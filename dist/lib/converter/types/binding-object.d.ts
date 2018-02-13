import * as ts from 'typescript';
import { Type } from '../../models/index';
import { ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';
export declare class BindingObjectConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.BindingPattern> {
    supportsNode(context: Context, node: ts.BindingPattern): boolean;
    convertNode(context: Context, node: ts.BindingPattern): Type;
}
