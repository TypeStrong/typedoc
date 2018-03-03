import * as ts from 'typescript';
declare module 'typescript' {
    interface Symbol {
        id?: number;
        parent?: ts.Symbol;
    }
    interface Node {
        symbol?: ts.Symbol;
        localSymbol?: ts.Symbol;
        nextContainer?: ts.Node;
    }
}
export declare function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: (string | number)[]): ts.Diagnostic;
export declare function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic;
export declare function compareValues<T>(a: T, b: T): number;
export declare function normalizeSlashes(path: string): string;
export declare function getRootLength(path: string): number;
export declare function getDirectoryPath(path: ts.Path): ts.Path;
export declare function getDirectoryPath(path: string): string;
export declare function normalizePath(path: string): string;
export declare function combinePaths(path1: string, path2: string): string;
export declare function getSourceFileOfNode(node: ts.Node): ts.SourceFile;
export declare function getTextOfNode(node: ts.Node, includeTrivia?: boolean): string;
export declare function declarationNameToString(name: ts.DeclarationName): string;
export declare function getJSDocCommentRanges(node: ts.Node, text: string): any;
export declare function isBindingPattern(node: ts.Node): node is ts.BindingPattern;
export declare function getClassExtendsHeritageClauseElement(node: ts.ClassLikeDeclaration | ts.InterfaceDeclaration): any;
export declare function getClassImplementsHeritageClauseElements(node: ts.ClassLikeDeclaration): any;
export declare function getInterfaceBaseTypeNodes(node: ts.InterfaceDeclaration): any;
export declare const CharacterCodes: {
    [key: string]: number;
    doubleQuote: number;
    space: number;
    minus: number;
    at: number;
};
export declare const optionDeclarations: CommandLineOption[];
export interface CommandLineOption {
    name: string;
    type: string;
    shortName: string;
    description: DiagnosticsEnumValue;
    paramType: DiagnosticsEnumValue;
}
export declare const Diagnostics: {
    [key: string]: DiagnosticsEnumValue;
    FILE: DiagnosticsEnumValue;
    DIRECTORY: DiagnosticsEnumValue;
};
export interface DiagnosticsEnumValue {
    code: number;
    category: ts.DiagnosticCategory;
    key: string;
    message: string;
}
