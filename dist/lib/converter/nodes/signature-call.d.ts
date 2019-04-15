import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class SignatureConverter extends ConverterNodeComponent<ts.FunctionExpression | ts.SignatureDeclaration | ts.FunctionExpression> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.FunctionExpression | ts.SignatureDeclaration | ts.FunctionExpression): Reflection;
}
