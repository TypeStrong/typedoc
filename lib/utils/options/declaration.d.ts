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
}
export declare enum ParameterScope {
    TypeDoc = 0,
    TypeScript = 1,
}
export interface IOptionDeclaration {
    name: string;
    component?: string;
    short?: string;
    help: string;
    type?: ParameterType;
    hint?: ParameterHint;
    scope?: ParameterScope;
    map?: {};
    mapError?: string;
    isArray?: boolean;
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
    map: Object;
    mapError: string;
    isArray: boolean;
    defaultValue: any;
    constructor(data: IOptionDeclaration);
    getNames(): string[];
    convert(value: any, errorCallback?: Function): any;
}
