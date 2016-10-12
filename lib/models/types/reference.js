"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var ReferenceType = (function (_super) {
    __extends(ReferenceType, _super);
    function ReferenceType(name, symbolID, reflection) {
        _super.call(this);
        this.name = name;
        this.symbolID = symbolID;
        this.reflection = reflection;
    }
    ReferenceType.prototype.clone = function () {
        var clone = new ReferenceType(this.name, this.symbolID, this.reflection);
        clone.isArray = this.isArray;
        clone.typeArguments = this.typeArguments;
        return clone;
    };
    ReferenceType.prototype.equals = function (type) {
        return type instanceof ReferenceType &&
            type.isArray == this.isArray &&
            (type.symbolID == this.symbolID || type.reflection == this.reflection);
    };
    ReferenceType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.type = 'reference';
        result.name = this.name;
        if (this.reflection) {
            result.id = this.reflection.id;
        }
        if (this.typeArguments) {
            result.typeArguments = this.typeArguments.map(function (t) { return t.toObject(); });
        }
        return result;
    };
    ReferenceType.prototype.toString = function () {
        if (this.reflection) {
            return this.reflection.name + (this.isArray ? '[]' : '');
        }
        else {
            return this.name + (this.isArray ? '[]' : '');
        }
    };
    ReferenceType.SYMBOL_ID_RESOLVED = -1;
    ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME = -2;
    return ReferenceType;
}(abstract_1.Type));
exports.ReferenceType = ReferenceType;
//# sourceMappingURL=reference.js.map