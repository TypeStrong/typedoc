import * as ts from "typescript";
const tsany = ts as any;

/**
 * Expose the internal TypeScript APIs that are used by TypeDoc
 */
declare module "typescript" {
  interface Symbol {
    // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2166
    id?: number;
    // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2168
    parent?: ts.Symbol;
  }

  interface Node {
    // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L469
    symbol?: ts.Symbol;
    // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L472
    localSymbol?: ts.Symbol;
    // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L471
    nextContainer?: ts.Node;
  }
}


/**
 * These functions are in "core" and are marked as @internal:
 * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L4-L5
 */

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L655-L656
export function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: any[]): ts.Diagnostic;
export function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic;
export function createCompilerDiagnostic() {
  return tsany.createCompilerDiagnostic.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L701
export function compareValues<T>(a: T, b: T): number {
  return tsany.compareValues.apply(this, arguments); // Actually returns a ts.Comparison which is also internal
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L790
export function normalizeSlashes(path: string): string {
  return tsany.normalizeSlashes.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L795
export function getRootLength(path: string): number {
  return tsany.getRootLength.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L852-L854
export function getDirectoryPath(path: ts.Path): ts.Path;
export function getDirectoryPath(path: string): string;
export function getDirectoryPath(path: string): any;
export function getDirectoryPath() {
  return tsany.getDirectoryPath.apply(this, arguments);
}

/**
 * These functions are in "utilities" and are marked as @internal:
 * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L3-L4
 */

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L188
export function getSourceFileOfNode(node: ts.Node): ts.SourceFile {
  return tsany.getSourceFileOfNode.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L333
export function getTextOfNode(node: ts.Node, includeTrivia?: boolean): string {
  return tsany.getTextOfNode.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L438
export function declarationNameToString(name: ts.DeclarationName): string {
  return tsany.declarationNameToString.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/utilities.ts#L1423
export function getJSDocCommentRanges(node: ts.Node, text: string) {
  return tsany.getJSDocCommentRanges.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1487
export function isBindingPattern(node: ts.Node): node is ts.BindingPattern {
  return tsany.isBindingPattern.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1696
export function getClassExtendsHeritageClauseElement(node: ts.ClassLikeDeclaration | ts.InterfaceDeclaration) {
  return tsany.getClassExtendsHeritageClauseElement.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1701
export function getClassImplementsHeritageClauseElements(node: ts.ClassLikeDeclaration) {
  return tsany.getClassImplementsHeritageClauseElements.apply(this, arguments);
}

// https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1706
export function getInterfaceBaseTypeNodes(node: ts.InterfaceDeclaration) {
  return tsany.getInterfaceBaseTypeNodes.apply(this, arguments);
}

/**
 * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2789-L2924
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

/**
 * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2334
 * Duplicating the interface definition :(
 */
// interface IntrinsicType extends ts.Type {
//   intrinsicName: string;
// }

export const optionDeclarations: CommandLineOption[] = tsany.optionDeclarations;

/**
 * Command line options
 */
export interface CommandLineOption {
  name: string;
  type: string;
  shortName: string;
  description: DiagnosticsEnumValue;
  paramType: DiagnosticsEnumValue;
}

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
