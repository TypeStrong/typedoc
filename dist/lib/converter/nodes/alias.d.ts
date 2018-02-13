import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class AliasConverter extends ConverterNodeComponent<ts.TypeAliasDeclaration> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.TypeAliasDeclaration): Reflection;
}
