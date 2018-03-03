"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_1 = require("./abstract");
var ReferenceType = (function (_super) {
    __extends(ReferenceType, _super);
    function ReferenceType(name, symbolID, reflection) {
        var _this = _super.call(this) || this;
        _this.type = 'reference';
        _this.name = name;
        _this.symbolID = symbolID;
        _this.reflection = reflection;
        return _this;
    }
    ReferenceType.prototype.clone = function () {
        var clone = new ReferenceType(this.name, this.symbolID, this.reflection);
        clone.typeArguments = this.typeArguments;
        return clone;
    };
    ReferenceType.prototype.equals = function (type) {
        return type instanceof ReferenceType &&
            (type.symbolID === this.symbolID || type.reflection === this.reflection);
    };
    ReferenceType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
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
        var name = this.reflection ? this.reflection.name : this.name;
        var typeArgs = '';
        if (this.typeArguments) {
            typeArgs += '<';
            typeArgs += this.typeArguments.map(function (arg) { return arg.toString(); }).join(', ');
            typeArgs += '>';
        }
        return name + typeArgs;
    };
    ReferenceType.SYMBOL_ID_RESOLVED = -1;
    ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME = -2;
    return ReferenceType;
}(abstract_1.Type));
exports.ReferenceType = ReferenceType;
//# sourceMappingURL=reference.js.map