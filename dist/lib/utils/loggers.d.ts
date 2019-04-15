import * as ts from 'typescript';
export declare enum LogLevel {
    Verbose = 0,
    Info = 1,
    Warn = 2,
    Error = 3,
    Success = 4
}
export declare class Logger {
    errorCount: number;
    hasErrors(): boolean;
    resetErrors(): void;
    write(text: string, ...args: string[]): void;
    writeln(text: string, ...args: string[]): void;
    success(text: string, ...args: string[]): void;
    verbose(text: string, ...args: string[]): void;
    warn(text: string, ...args: string[]): void;
    error(text: string, ...args: string[]): void;
    log(message: string, level?: LogLevel, newLine?: boolean): void;
    diagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>): void;
    diagnostic(diagnostic: ts.Diagnostic): void;
}
export declare class ConsoleLogger extends Logger {
    log(message: string, level?: LogLevel, newLine?: boolean): void;
}
export declare class CallbackLogger extends Logger {
    callback: Function;
    constructor(callback: Function);
    log(message: string, level?: LogLevel, newLine?: boolean): void;
}
