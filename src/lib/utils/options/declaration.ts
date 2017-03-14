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

    protected map: Object | Map<string, any> | 'object';

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
                const map = this.map;
                if (map !== 'object') {
                    const key = value ? (value + '').toLowerCase() : '';

                    if (map instanceof Map && map.has(key)) {
                        value = map.get(key);
                    } else if (key in map) {
                        value = map[key];
                    } else if (errorCallback) {
                        const message = this.mapError ? [this.mapError] : ['Invalid value for option "%s".', this.name];
                        errorCallback(... message);
                    }
                }
                break;
        }

        return value;
    }
}
