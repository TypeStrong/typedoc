import * as ts from 'typescript';
import { Type } from '../../models/types/index';
import { ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';
export declare class ThisConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.ThisTypeNode> {
    supportsNode(context: Context, node: ts.ThisTypeNode, type: ts.Type): boolean;
    convertNode(context: Context, node: ts.ThisTypeNode, type: ts.Type): Type;
}
