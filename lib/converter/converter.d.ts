import * as ts from "typescript";
import { Application } from "../application";
import { Reflection, Type, ProjectReflection } from "../models/index";
import { Context } from "./context";
import { ConverterComponent } from "./components";
import { ChildableComponent, IComponentClass } from "../utils/component";
export interface IConverterResult {
    errors: ts.Diagnostic[];
    project: ProjectReflection;
}
export declare class Converter extends ChildableComponent<Application, ConverterComponent> {
    name: string;
    externalPattern: string;
    includeDeclarations: boolean;
    excludeExternals: boolean;
    excludeNotExported: boolean;
    excludePrivate: boolean;
    private compilerHost;
    private nodeConverters;
    private typeNodeConverters;
    private typeTypeConverters;
    static EVENT_BEGIN: string;
    static EVENT_END: string;
    static EVENT_FILE_BEGIN: string;
    static EVENT_CREATE_DECLARATION: string;
    static EVENT_CREATE_SIGNATURE: string;
    static EVENT_CREATE_PARAMETER: string;
    static EVENT_CREATE_TYPE_PARAMETER: string;
    static EVENT_FUNCTION_IMPLEMENTATION: string;
    static EVENT_RESOLVE_BEGIN: string;
    static EVENT_RESOLVE: string;
    static EVENT_RESOLVE_END: string;
    initialize(): void;
    addComponent(name: string, componentClass: IComponentClass<ConverterComponent>): ConverterComponent;
    private addNodeConverter(converter);
    private addTypeConverter(converter);
    removeComponent(name: string): ConverterComponent;
    private removeNodeConverter(converter);
    private removeTypeConverter(converter);
    removeAllComponents(): void;
    convert(fileNames: string[]): IConverterResult;
    convertNode(context: Context, node: ts.Node): Reflection;
    convertType(context: Context, node?: ts.Node, type?: ts.Type): Type;
    private compile(context);
    private resolve(context);
    getDefaultLib(): string;
}
