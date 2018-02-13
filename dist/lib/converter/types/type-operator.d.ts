import * as ts from 'typescript';
import { TypeOperatorType } from '../../models/types/index';
import { ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';
export declare class TypeOperatorConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.TypeOperatorNode> {
    priority: number;
    supportsNode(context: Context, node: ts.TypeOperatorNode, type: ts.Type): boolean;
    convertNode(context: Context, node: ts.TypeOperatorNode): TypeOperatorType;
}
