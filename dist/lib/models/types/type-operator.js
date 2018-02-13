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
var TypeOperatorType = (function (_super) {
    __extends(TypeOperatorType, _super);
    function TypeOperatorType(target) {
        var _this = _super.call(this) || this;
        _this.type = 'typeOperator';
        _this.operator = 'keyof';
        _this.target = target;
        return _this;
    }
    TypeOperatorType.prototype.clone = function () {
        return new TypeOperatorType(this.target.clone());
    };
    TypeOperatorType.prototype.equals = function (type) {
        if (!(type instanceof TypeOperatorType)) {
            return false;
        }
        return type.target.equals(this.target);
    };
    TypeOperatorType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.operator = this.operator;
        result.target = this.target.toObject();
        return result;
    };
    TypeOperatorType.prototype.toString = function () {
        return "keyof " + this.target.toString();
    };
    return TypeOperatorType;
}(abstract_1.Type));
exports.TypeOperatorType = TypeOperatorType;
//# sourceMappingURL=type-operator.js.map