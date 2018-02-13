import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class VariableConverter extends ConverterNodeComponent<ts.VariableDeclaration> {
    supports: ts.SyntaxKind[];
    isSimpleObjectLiteral(objectLiteral: ts.ObjectLiteralExpression): boolean;
    convert(context: Context, node: ts.VariableDeclaration): Reflection;
}
