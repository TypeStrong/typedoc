import * as ts from 'typescript';
import { ReferenceType } from '../../models/index';
import { ConverterTypeComponent, TypeNodeConverter } from '../components';
import { Context } from '../context';
export declare class AliasConverter extends ConverterTypeComponent implements TypeNodeConverter<ts.Type, ts.TypeReferenceNode> {
    priority: number;
    supportsNode(context: Context, node: ts.TypeReferenceNode, type: ts.Type): boolean;
    convertNode(context: Context, node: ts.TypeReferenceNode): ReferenceType;
}
