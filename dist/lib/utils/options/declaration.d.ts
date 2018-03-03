export declare enum ParameterHint {
    File = 0,
    Directory = 1,
}
export declare enum ParameterType {
    String = 0,
    Number = 1,
    Boolean = 2,
    Map = 3,
    Mixed = 4,
    Array = 5,
}
export declare enum ParameterScope {
    TypeDoc = 0,
    TypeScript = 1,
}
export interface DeclarationOption {
    name: string;
    component?: string;
    short?: string;
    help: string;
    type?: ParameterType;
    hint?: ParameterHint;
    scope?: ParameterScope;
    map?: {};
    mapError?: string;
    defaultValue?: any;
    convert?: (param: OptionDeclaration, value?: any) => any;
}
export declare class OptionDeclaration {
    name: string;
    short: string;
    component: string;
    help: string;
    type: ParameterType;
    hint: ParameterHint;
    scope: ParameterScope;
    protected map: Object | Map<string, any> | 'object';
    mapError: string;
    isArray: boolean;
    defaultValue: any;
    constructor(data: DeclarationOption);
    getNames(): string[];
    convert(value: any, errorCallback?: Function): any;
}
