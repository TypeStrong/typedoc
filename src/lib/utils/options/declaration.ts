import * as ts from 'typescript';
import * as Util from 'util';


export enum ParameterHint {
    File,
    Directory
}

export enum ParameterType {
    String,
    Number,
    Boolean,
    Map,
    Mixed,
    Array
}


export enum ParameterScope {
    TypeDoc, TypeScript
}


export interface IOptionDeclaration
{
    name:string;
    component?:string;
    short?:string;
    help:string;
    type?:ParameterType;
    hint?:ParameterHint;
    scope?:ParameterScope;
    map?:{};
    mapError?:string;
    isArray?:boolean;
    defaultValue?:any;
    convert?:(param:OptionDeclaration, value?:any) => any;
}


export class OptionDeclaration
{
    name:string;

    short:string;

    component:string;

    help:string;

    type:ParameterType;

    hint:ParameterHint;

    scope:ParameterScope;

    map:Object;

    mapError:string;

    isArray:boolean;

    defaultValue:any;



    constructor(data:IOptionDeclaration) {
        for (let key in data) {
            this[key] = data[key];
        }

        this.type  = this.type  || ParameterType.String;
        this.scope = this.scope || ParameterScope.TypeDoc;
    }


    getNames():string[] {
        const result = [this.name.toLowerCase()];

        if (this.short) {
            result.push(this.short.toLowerCase());
        }

        return result;
    }


    convert(value:any, errorCallback?:Function):any {
        switch (this.type) {
            case ParameterType.Number:
                value = parseInt(value, 10);
                break;
            case ParameterType.Boolean:
                value = (typeof value === void 0 ? true : !!value);
                break;
            case ParameterType.String:
                value = value || '';
                break;
            case ParameterType.Array:
                if (!value) {
                    value = [];
                } else if (typeof value === 'string') {
                    value = value.split(',');
                }
                break;
            case ParameterType.Map:
                if (this.map !== 'object') {
                    const key = value ? (value + '').toLowerCase() : '';
                    if (key in this.map) {
                        value = this.map[key];
                    } else if (errorCallback) {
                        if (this.mapError) {
                            errorCallback(this.mapError);
                        } else {
                            errorCallback('Invalid value for option "%s".', this.name);
                        }
                    }
                }
                break;
        }

        return value;
    }
}
