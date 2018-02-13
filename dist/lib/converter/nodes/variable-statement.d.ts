import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class VariableStatementConverter extends ConverterNodeComponent<ts.VariableStatement> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.VariableStatement): Reflection;
    convertBindingPattern(context: Context, node: ts.BindingPattern): void;
}
