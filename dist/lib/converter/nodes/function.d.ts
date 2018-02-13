import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class FunctionConverter extends ConverterNodeComponent<ts.FunctionDeclaration | ts.MethodDeclaration> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.FunctionDeclaration | ts.MethodDeclaration): Reflection;
}
