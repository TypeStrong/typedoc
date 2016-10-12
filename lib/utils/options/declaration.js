"use strict";
(function (ParameterHint) {
    ParameterHint[ParameterHint["File"] = 0] = "File";
    ParameterHint[ParameterHint["Directory"] = 1] = "Directory";
})(exports.ParameterHint || (exports.ParameterHint = {}));
var ParameterHint = exports.ParameterHint;
(function (ParameterType) {
    ParameterType[ParameterType["String"] = 0] = "String";
    ParameterType[ParameterType["Number"] = 1] = "Number";
    ParameterType[ParameterType["Boolean"] = 2] = "Boolean";
    ParameterType[ParameterType["Map"] = 3] = "Map";
    ParameterType[ParameterType["Mixed"] = 4] = "Mixed";
})(exports.ParameterType || (exports.ParameterType = {}));
var ParameterType = exports.ParameterType;
(function (ParameterScope) {
    ParameterScope[ParameterScope["TypeDoc"] = 0] = "TypeDoc";
    ParameterScope[ParameterScope["TypeScript"] = 1] = "TypeScript";
})(exports.ParameterScope || (exports.ParameterScope = {}));
var ParameterScope = exports.ParameterScope;
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
                value = parseInt(value);
                break;
            case ParameterType.Boolean:
                value = (typeof value === void 0 ? true : !!value);
                break;
            case ParameterType.String:
                value = value || "";
                break;
            case ParameterType.Map:
                var key = value ? (value + "").toLowerCase() : '';
                if (key in this.map) {
                    value = this.map[key];
                }
                else if (errorCallback) {
                    if (this.mapError) {
                        errorCallback(this.mapError);
                    }
                    else {
                        errorCallback('Invalid value for option "%s".', this.name);
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