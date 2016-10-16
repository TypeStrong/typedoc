import * as ts from "typescript";

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

  /**
   * These functions are in "core" and are marked as @internal:
   * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L4-L5
   */

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L411
  function hasProperty<T>(map: ts.MapLike<T>, key: string): boolean;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L655-L656
  export function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: any[]): ts.Diagnostic;
  export function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L701
  function compareValues<T>(a: T, b: T): number; // Actually returns a ts.Comparison which is internal

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L790
  function normalizeSlashes(path: string): string;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L795
  function getRootLength(path: string): number;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L845
  function normalizePath(path: string): string;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/core.ts#L852-L854
  function getDirectoryPath(path: ts.Path): ts.Path;
  function getDirectoryPath(path: string): string;
  function getDirectoryPath(path: string): any;

  /**
   * These functions are in "utilities" and are marked as @internal:
   * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L3-L4
   */

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L188
  function getSourceFileOfNode(node: ts.Node): ts.SourceFile;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L333
  function getTextOfNode(node: ts.Node, includeTrivia?: boolean): string;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L438
  function declarationNameToString(name: ts.DeclarationName);

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L598
  function getJsDocComments(node: ts.Node, sourceFileOfNode: ts.SourceFile);

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1487
  function isBindingPattern(node: ts.Node): node is ts.BindingPattern;

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1696
  function getClassExtendsHeritageClauseElement(node: ts.ClassLikeDeclaration | ts.InterfaceDeclaration);

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1701
  function getClassImplementsHeritageClauseElements(node: ts.ClassLikeDeclaration);

  // https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/utilities.ts#L1706
  function getInterfaceBaseTypeNodes(node: ts.InterfaceDeclaration);


  /**
   * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2789-L2924
   * This is large enum of char codes.
   *
   * Faking the enum as a var (only certain codes are used by TypeDoc)
   */
  var CharacterCodes: {
    [key: string]: number;
    doubleQuote: number;
    space: number;
    minus: number;
    at: number;
  };

  /**
   * https://github.com/Microsoft/TypeScript/blob/v2.0.5/src/compiler/types.ts#L2334
   * Duplicating the interface definition :(
   */
  interface IntrinsicType extends ts.Type {
    intrinsicName: string;
  }

  const optionDeclarations: CommandLineOption[];

  /**
   * Command line options
   */
  interface CommandLineOption {
    name: string;
    type: string;
    shortName: string;
    description: DiagnosticsEnumValue;
    paramType: DiagnosticsEnumValue;
  }

  const Diagnostics: {
    [key: string]: DiagnosticsEnumValue;
    FILE: DiagnosticsEnumValue;
    DIRECTORY: DiagnosticsEnumValue;
  };

  interface DiagnosticsEnumValue {
    code: number;
    category: ts.DiagnosticCategory;
    key: string;
    message: string;
  }

}
