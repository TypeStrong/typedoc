"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
var ParameterHint;
(function (ParameterHint) {
    ParameterHint[ParameterHint["File"] = 0] = "File";
    ParameterHint[ParameterHint["Directory"] = 1] = "Directory";
})(ParameterHint = exports.ParameterHint || (exports.ParameterHint = {}));
var ParameterType;
(function (ParameterType) {
    ParameterType[ParameterType["String"] = 0] = "String";
    ParameterType[ParameterType["Number"] = 1] = "Number";
    ParameterType[ParameterType["Boolean"] = 2] = "Boolean";
    ParameterType[ParameterType["Map"] = 3] = "Map";
    ParameterType[ParameterType["Mixed"] = 4] = "Mixed";
    ParameterType[ParameterType["Array"] = 5] = "Array";
})(ParameterType = exports.ParameterType || (exports.ParameterType = {}));
var ParameterScope;
(function (ParameterScope) {
    ParameterScope[ParameterScope["TypeDoc"] = 0] = "TypeDoc";
    ParameterScope[ParameterScope["TypeScript"] = 1] = "TypeScript";
})(ParameterScope = exports.ParameterScope || (exports.ParameterScope = {}));
class OptionDeclaration {
    constructor(data) {
        this.type = ParameterType.String;
        this.scope = ParameterScope.TypeDoc;
        for (let key in data) {
            this[key] = data[key];
        }
    }
    getNames() {
        const result = [this.name.toLowerCase()];
        if (this.short) {
            result.push(this.short.toLowerCase());
        }
        return result;
    }
    convert(value, errorCallback) {
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
                }
                else if (typeof value === 'string') {
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
                    }
                    else if (key in map) {
                        value = map[key];
                    }
                    else if (!values.includes(value) && errorCallback) {
                        if (this.mapError) {
                            errorCallback(this.mapError);
                        }
                        else {
                            errorCallback('Invalid value for option "%s".', this.name);
                        }
                    }
                }
                break;
        }
        return value;
    }
}
exports.OptionDeclaration = OptionDeclaration;
//# sourceMappingURL=declaration.js.map