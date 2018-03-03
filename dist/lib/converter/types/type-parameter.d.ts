import * as ts from 'typescript';
import { Type } from '../../models/types/index';
import { ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';
export declare class TypeParameterConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.TypeReferenceNode> {
    priority: number;
    supportsNode(context: Context, node: ts.TypeReferenceNode, type: ts.Type): boolean;
    convertNode(context: Context, node: ts.TypeReferenceNode): Type;
}
