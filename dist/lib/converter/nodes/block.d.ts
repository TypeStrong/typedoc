import * as ts from 'typescript';
import { Reflection } from '../../models/index';
import { Context } from '../context';
import { ConverterNodeComponent } from '../components';
export declare enum SourceFileMode {
    File = 0,
    Modules = 1
}
export declare class BlockConverter extends ConverterNodeComponent<ts.SourceFile | ts.Block | ts.ModuleBlock> {
    mode: SourceFileMode;
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.SourceFile | ts.Block | ts.ModuleBlock): Reflection;
    private convertSourceFile;
    private convertStatements;
}
