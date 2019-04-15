import * as ts from 'typescript';
declare module 'typescript' {
    interface Symbol {
        id?: number;
        parent?: ts.Symbol;
    }
    interface Node {
        symbol?: ts.Symbol;
        localSymbol?: ts.Symbol;
    }
}
export declare function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: (string | number)[]): ts.Diagnostic;
export declare function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic;
export declare const optionDeclarations: CommandLineOption[];
export interface CommandLineOptionBase {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'list' | Map<number | string, any>;
    isFilePath?: boolean;
    shortName?: string;
    description?: ts.DiagnosticMessage;
    paramType?: ts.DiagnosticMessage;
    experimental?: boolean;
    isTSConfigOnly?: boolean;
}
export interface CommandLineOptionOfPrimitiveType extends CommandLineOptionBase {
    type: 'string' | 'number' | 'boolean';
}
export interface CommandLineOptionOfCustomType extends CommandLineOptionBase {
    type: Map<number | string, any>;
}
export interface TsConfigOnlyOption extends CommandLineOptionBase {
    type: 'object';
}
export interface CommandLineOptionOfListType extends CommandLineOptionBase {
    type: 'list';
    element: CommandLineOptionOfCustomType | CommandLineOptionOfPrimitiveType;
}
export declare type CommandLineOption = CommandLineOptionOfCustomType | CommandLineOptionOfPrimitiveType | TsConfigOnlyOption | CommandLineOptionOfListType;
