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
    isArray?: boolean;
    defaultValue?: any;
    convert?: (param: OptionDeclaration, value?: any) => any;
}

export class OptionDeclaration {
    name: string;

    short: string;

    component: string;

    help: string;

    type: ParameterType;

    hint: ParameterHint;

    scope: ParameterScope;

    protected map: Object | Map<string, string> | 'object';

    mapError: string;

    isArray: boolean;

    defaultValue: any;

    constructor(data: DeclarationOption) {
        for (let key in data) {
            this[key] = data[key];
        }

        this.type  = this.type  || ParameterType.String;
        this.scope = this.scope || ParameterScope.TypeDoc;
    }

    getNames(): string[] {
        const result = [this.name.toLowerCase()];

        if (this.short) {
            result.push(this.short.toLowerCase());
        }

        return result;
    }

    convert(value: any, errorCallback?: Function): any {
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
                const key = value ? (value + '').toLowerCase() : '';
                try {
                    this.getMapValue(key);
                } catch (error) {
                    if (errorCallback) {
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

    protected getMapValue(key: string): any {
        const map = this.map;

        if (map === 'object') {
            return undefined;
        } else if (map instanceof Map) {
            if (map.has(key)) {
                return map.get(key);
            }
        } else if (key in map) {
            return map[key];
        }

        throw new Error('Invalid value for option');
    }
}
