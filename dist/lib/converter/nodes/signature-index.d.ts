import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class IndexSignatureConverter extends ConverterNodeComponent<ts.SignatureDeclaration> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.SignatureDeclaration): Reflection;
}
