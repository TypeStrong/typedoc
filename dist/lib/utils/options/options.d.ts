import * as ts from 'typescript';
import { Event } from '../events';
import { AbstractComponent, ChildableComponent } from '../component';
import { Application } from '../../application';
import { OptionDeclaration, DeclarationOption, ParameterScope } from './declaration';
export declare class OptionsComponent extends AbstractComponent<Options> {
}
export declare enum OptionsReadMode {
    Prefetch = 0,
    Fetch = 1
}
export interface OptionsReadResult {
    hasErrors: boolean;
    inputFiles: string[];
}
export declare class DiscoverEvent extends Event {
    readonly mode: OptionsReadMode;
    data: any;
    constructor(name: string, mode: OptionsReadMode);
    inputFiles: string[];
    errors: string[];
    static DISCOVER: string;
    addInputFile(fileName: string): void;
    addError(message: string, ...args: string[]): void;
}
export declare class Options extends ChildableComponent<Application, OptionsComponent> {
    private declarations;
    private values;
    private compilerOptions;
    initialize(): void;
    read(data?: any, mode?: OptionsReadMode): OptionsReadResult;
    getValue(name: string): any;
    getRawValues(): any;
    getDeclaration(name: string): OptionDeclaration | undefined;
    getDeclarationsByScope(scope: ParameterScope): OptionDeclaration[];
    getCompilerOptions(): ts.CompilerOptions;
    setValue(name: string | OptionDeclaration, value: any, errorCallback?: (format: string, ...args: string[]) => void): void;
    setValues(obj: Object, prefix?: string, errorCallback?: (format: string, ...args: string[]) => void): void;
    addDeclaration(declaration: OptionDeclaration | DeclarationOption): void;
    addDeclarations(declarations: (OptionDeclaration | DeclarationOption)[]): void;
    removeDeclaration(declaration: OptionDeclaration): void;
    removeDeclarationByName(name: string): void;
}
