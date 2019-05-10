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
  }
}

// Everything past here is required for supporting TypeScript's command line options.
// If TypeDoc dropped support for allowing all of tsc's cli flags, this can all go.

// https://github.com/Microsoft/TypeScript/blob/v2.1.4/src/compiler/core.ts#L1133-LL1134
export function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: (string | number)[]): ts.Diagnostic;
export function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic;
export function createCompilerDiagnostic() {
  return tsany.createCompilerDiagnostic.apply(this, arguments);
}

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
