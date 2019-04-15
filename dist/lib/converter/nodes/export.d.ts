import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare class ExportConverter extends ConverterNodeComponent<ts.ExportAssignment> {
    supports: ts.SyntaxKind[];
    private _convertExportAllDeclaration;
    private _convertExportDeclaration;
    convert(context: Context, node: ts.ExportAssignment | ts.ExportDeclaration): Reflection | undefined;
}
