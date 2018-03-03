"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var OptionDeclaration = (function () {
    function OptionDeclaration(data) {
        for (var key in data) {
            this[key] = data[key];
        }
        this.type = this.type || ParameterType.String;
        this.scope = this.scope || ParameterScope.TypeDoc;
    }
    OptionDeclaration.prototype.getNames = function () {
        var result = [this.name.toLowerCase()];
        if (this.short) {
            result.push(this.short.toLowerCase());
        }
        return result;
    };
    OptionDeclaration.prototype.convert = function (value, errorCallback) {
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
                }
                else if (typeof value === 'string') {
                    value = value.split(',');
                }
                break;
            case ParameterType.Map:
                var map_1 = this.map;
                if (map_1 !== 'object') {
                    var key = value ? (value + '').toLowerCase() : '';
                    var values = Object.keys(map_1).map(function (key) { return map_1[key]; });
                    if (map_1 instanceof Map) {
                        value = map_1.has(key) ? map_1.get(key) : value;
                    }
                    else if (key in map_1) {
                        value = map_1[key];
                    }
                    else if (values.indexOf(value) === -1 && errorCallback) {
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
    };
    return OptionDeclaration;
}());
exports.OptionDeclaration = OptionDeclaration;
//# sourceMappingURL=declaration.js.map