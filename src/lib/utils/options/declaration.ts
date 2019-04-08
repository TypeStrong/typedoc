import * as _ from 'lodash';

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
    TypeDoc,
    TypeScript
}

/**
 * Option-bag passed to Option decorator.
 *
 * TODO: This should be a union type of multiple possible option types.
 */
export interface DeclarationOption {
    name: string;
    component?: string;
    short?: string;
    help: string;
    type?: ParameterType;
    hint?: ParameterHint;
    scope?: ParameterScope;
    map?: 'object' | Map<string | number, any> | { [ key: string]: any };
    mapError?: string;
    defaultValue?: any;
    convert?: (param: OptionDeclaration, value?: any) => any;
}

/**
 * Runtime structure describing a configuration option.
 * Used by option parsing and validation.
 */
export class OptionDeclaration {
    name!: string;

    component?: string;

    short?: string;

    help!: string;

    type: ParameterType = ParameterType.String;

    hint?: ParameterHint;

    scope: ParameterScope = ParameterScope.TypeDoc;

    protected map?: { [k: string]: any } | 'object';

    mapError?: string;

    defaultValue: any;

    constructor(data: DeclarationOption) {
        for (let key in data) {
            this[key] = data[key];
        }
    }

    getNames(): string[] {
        const result = [this.name.toLowerCase()];

        if (this.short) {
            result.push(this.short.toLowerCase());
        }

        return result;
    }

    /**
     *
     * @param value the value the user passed in
     * @param errorCallback
     */
    convert(value: unknown, errorCallback?: (format: string, ...args: string[]) => void): any {
        switch (this.type) {
            case ParameterType.Number:
                value = parseInt(value + '', 10);
                break;
            case ParameterType.Boolean:
                value = !!value;
                break;
            case ParameterType.String:
                value = value ? value + '' : '';
                break;
            case ParameterType.Array:
                if (!value) {
                    value = [];
                // TSLint *should* be correct here, but tslint doesn't know about user config files.
                // tslint:disable-next-line:strict-type-predicates
                } else if (typeof value === 'string') {
                    value = value.split(',');
                }
                break;
            case ParameterType.Map:
                const map = this.map || {};
                if (map !== 'object') {
                    const key = value ? (value + '').toLowerCase() : '';
                    const values = _.values(map);

                    if (map instanceof Map) {
                        value = map.has(key) ? map.get(key) : value;
                    } else if (key in map) {
                        value = map[key];
                    } else if (!values.includes(value) && errorCallback) {
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
