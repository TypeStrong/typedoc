"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var UnionType = (function (_super) {
    __extends(UnionType, _super);
    function UnionType(types) {
        _super.call(this);
        this.types = types;
    }
    UnionType.prototype.clone = function () {
        var clone = new UnionType(this.types);
        clone.isArray = this.isArray;
        return clone;
    };
    UnionType.prototype.equals = function (type) {
        if (!(type instanceof UnionType))
            return false;
        if (type.isArray != this.isArray)
            return false;
        return abstract_1.Type.isTypeListSimiliar(type.types, this.types);
    };
    UnionType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.type = 'union';
        if (this.types && this.types.length) {
            result.types = this.types.map(function (e) { return e.toObject(); });
        }
        return result;
    };
    UnionType.prototype.toString = function () {
        var names = [];
        this.types.forEach(function (element) {
            names.push(element.toString());
        });
        return names.join(' | ');
    };
    return UnionType;
}(abstract_1.Type));
exports.UnionType = UnionType;
//# sourceMappingURL=union.js.map