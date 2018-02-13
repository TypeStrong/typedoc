import * as ts from 'typescript';
import { UnionType, IntersectionType } from '../../models/types/index';
import { ConverterTypeComponent, TypeConverter } from '../components';
import { Context } from '../context';
export declare class UnionOrIntersectionConverter extends ConverterTypeComponent implements TypeConverter<ts.UnionOrIntersectionType, ts.UnionOrIntersectionTypeNode> {
    supportsNode(context: Context, node: ts.UnionOrIntersectionTypeNode): boolean;
    supportsType(context: Context, type: ts.UnionOrIntersectionType): boolean;
    convertNode(context: Context, node: ts.UnionOrIntersectionTypeNode): UnionType | IntersectionType;
    convertType(context: Context, type: ts.UnionOrIntersectionType): UnionType | IntersectionType;
}
