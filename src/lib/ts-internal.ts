import * as ts from 'typescript';
const tsany = ts as any;

/**
 * Expose the internal TypeScript APIs that are used by TypeDoc
 */
declare module 'typescript' {
  interface Symbol {
    // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L2658
    id?: number;
    // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L2660
    parent?: ts.Symbol;
  }

  interface Node {
    // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L497
    symbol?: ts.Symbol;
    // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L500
    localSymbol?: ts.Symbol;
    // https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L499
    nextContainer?: ts.Node;
  }
}

/**
 * These functions are in "core" and are marked as @internal:
 * https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L9-L10
 */

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L1133-LL1134
export function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: (string | number)[]): ts.Diagnostic;
export function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic;
export function createCompilerDiagnostic() {
  return tsany.createCompilerDiagnostic.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L1191
export function compareValues<T>(a: T, b: T): number {
  return tsany.compareValues.apply(this, arguments); // Actually returns a ts.Comparison which is also internal
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L1281
export function normalizeSlashes(path: string): string {
  return tsany.normalizeSlashes.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L1288
export function getRootLength(path: string): number {
  return tsany.getRootLength.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L1368-L1370
export function getDirectoryPath(path: ts.Path): ts.Path;
export function getDirectoryPath(path: string): string;
export function getDirectoryPath() {
  return tsany.getDirectoryPath.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.2.1/src/compiler/core.ts#L1418
export function normalizePath(path: string): string {
  return tsany.normalizePath(path);
}

// https://github.com/Microsoft/TypeScript/blob/v2.2.1/src/compiler/core.ts#L1628
export function combinePaths(path1: string, path2: string): string {
  return tsany.combinePaths(path1, path2);
}

/**
 * These functions are in "utilities" and are marked as @internal:
 * https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L3-L4
 */

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L152
export function getSourceFileOfNode(node: ts.Node): ts.SourceFile {
  return tsany.getSourceFileOfNode.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L301
export function getTextOfNode(node: ts.Node, includeTrivia = false): string {
  return tsany.getTextOfNode.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L473
export function declarationNameToString(name: ts.DeclarationName): string {
  return tsany.declarationNameToString.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L1423
export function getJSDocCommentRanges(node: ts.Node, text: string) {
  return tsany.getJSDocCommentRanges.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L3738
export function isBindingPattern(node: ts.Node): node is ts.BindingPattern {
  return tsany.isBindingPattern.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v3.0.1/src/compiler/utilities.ts#L2408
export function getEffectiveBaseTypeNode(node: ts.ClassLikeDeclaration | ts.InterfaceDeclaration) {
  return tsany.getEffectiveBaseTypeNode.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L1734
export function getClassImplementsHeritageClauseElements(node: ts.ClassLikeDeclaration): ts.NodeArray<ts.ExpressionWithTypeArguments> | undefined {
  return tsany.getClassImplementsHeritageClauseElements.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L1739
export function getInterfaceBaseTypeNodes(node: ts.InterfaceDeclaration) {
  return tsany.getInterfaceBaseTypeNodes.apply(this, arguments);
}

/**
 * https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L3347
 * This is large enum of char codes.
 *
 * Faking the enum as a var (only certain codes are used by TypeDoc)
 */
export const CharacterCodes: {
  [key: string]: number;
  doubleQuote: number;
  space: number;
  minus: number;
  at: number;
} = tsany.CharacterCodes;

export const optionDeclarations: CommandLineOption[] = tsany.optionDeclarations;

/**
 * Command line options
 *
 * https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/types.ts#L3310
 */
export interface CommandLineOptionBase {
  name: string;
  /**
   * a value of a primitive type, or an object literal mapping named values to actual values
   */
  type: 'string' | 'number' | 'boolean' | 'object' | 'list' | Map<number | string, any>;
  /**
   * True if option value is a path or fileName
   */
  isFilePath?: boolean;
  /**
   * A short mnemonic for convenience - for instance, 'h' can be used in place of 'help'
   */
  shortName?: string;
  /**
   * The message describing what the command line switch does
   */
  description?: ts.DiagnosticMessage;
  /**
   * The name to be used for a non-boolean option's parameter
   */
  paramType?: ts.DiagnosticMessage;
  experimental?: boolean;
  /**
   * True if option can only be specified via tsconfig.json file
   */
  isTSConfigOnly?: boolean;
}

export interface CommandLineOptionOfPrimitiveType extends CommandLineOptionBase {
  type: 'string' | 'number' | 'boolean';
}

export interface CommandLineOptionOfCustomType extends CommandLineOptionBase {
  type: Map<number | string, any>;  // an object literal mapping named values to actual values
}

export interface TsConfigOnlyOption extends CommandLineOptionBase {
  type: 'object';
}

export interface CommandLineOptionOfListType extends CommandLineOptionBase {
  type: 'list';
  element: CommandLineOptionOfCustomType | CommandLineOptionOfPrimitiveType;
}

export type CommandLineOption = CommandLineOptionOfCustomType | CommandLineOptionOfPrimitiveType | TsConfigOnlyOption | CommandLineOptionOfListType;

export const Diagnostics: {
  [key: string]: DiagnosticsEnumValue;
  FILE: DiagnosticsEnumValue;
  DIRECTORY: DiagnosticsEnumValue;
} = tsany.Diagnostics;

export interface DiagnosticsEnumValue {
  code: number;
  category: ts.DiagnosticCategory;
  key: string;
  message: string;
}
