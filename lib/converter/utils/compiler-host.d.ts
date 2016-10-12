import * as ts from "typescript";
import { ConverterComponent } from "../components";
export declare class CompilerHost extends ConverterComponent implements ts.CompilerHost {
    private currentDirectory;
    getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    getDirectories(path: string): string[];
    getCurrentDirectory(): string;
    useCaseSensitiveFileNames(): boolean;
    fileExists(fileName: string): boolean;
    readFile(fileName: string): string;
    getCanonicalFileName(fileName: string): string;
    getNewLine(): string;
    writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
}
