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
var index_1 = require("./index");
var ArrayType = (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(elementType) {
        var _this = _super.call(this) || this;
        _this.type = 'array';
        _this.elementType = elementType;
        return _this;
    }
    ArrayType.prototype.clone = function () {
        return new ArrayType(this.elementType);
    };
    ArrayType.prototype.equals = function (type) {
        if (!(type instanceof ArrayType)) {
            return false;
        }
        return type.elementType.equals(this.elementType);
    };
    ArrayType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.elementType = this.elementType.toObject();
        return result;
    };
    ArrayType.prototype.toString = function () {
        var elementTypeStr = this.elementType.toString();
        if (this.elementType instanceof index_1.UnionType || this.elementType instanceof index_1.IntersectionType) {
            return '(' + elementTypeStr + ')[]';
        }
        else {
            return elementTypeStr + '[]';
        }
    };
    return ArrayType;
}(index_1.Type));
exports.ArrayType = ArrayType;
//# sourceMappingURL=array.js.map