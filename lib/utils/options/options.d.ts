import * as ts from "typescript";
import { Event } from "../events";
import { AbstractComponent, ChildableComponent } from "../component";
import { Application } from "../../application";
import { OptionDeclaration, IOptionDeclaration, ParameterScope } from "./declaration";
export declare class OptionsComponent extends AbstractComponent<Options> {
}
export declare enum OptionsReadMode {
    Prefetch = 0,
    Fetch = 1,
}
export interface IOptionsReadResult {
    hasErrors: boolean;
    inputFiles: string[];
}
export declare class DiscoverEvent extends Event {
    data: any;
    mode: OptionsReadMode;
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
    read(data?: any, mode?: OptionsReadMode): IOptionsReadResult;
    getValue(name: string): any;
    getRawValues(): any;
    getDeclaration(name: string): OptionDeclaration;
    getDeclarationsByScope(scope: ParameterScope): OptionDeclaration[];
    getCompilerOptions(): ts.CompilerOptions;
    setValue(name: string | OptionDeclaration, value: any, errorCallback?: Function): void;
    setValues(obj: Object, prefix?: string, errorCallback?: Function): void;
    addDeclaration(declaration: OptionDeclaration | IOptionDeclaration): void;
    addDeclarations(declarations: (OptionDeclaration | IOptionDeclaration)[]): void;
    removeDeclaration(declaration: OptionDeclaration): void;
    removeDeclarationByName(name: string): void;
}
