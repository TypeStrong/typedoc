import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare enum SourceFileMode {
    File = 0,
    Modules = 1,
}
export declare class BlockConverter extends ConverterNodeComponent<ts.SourceFile | ts.Block | ts.ModuleBlock> {
    mode: number;
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.SourceFile | ts.Block | ts.ModuleBlock): Reflection;
    private convertSourceFile(context, node);
    private convertStatements(context, node);
}
