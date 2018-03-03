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
var TypeParameterType = (function (_super) {
    __extends(TypeParameterType, _super);
    function TypeParameterType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'typeParameter';
        return _this;
    }
    TypeParameterType.prototype.clone = function () {
        var clone = new TypeParameterType();
        clone.name = this.name;
        clone.constraint = this.constraint;
        return clone;
    };
    TypeParameterType.prototype.equals = function (type) {
        if (!(type instanceof TypeParameterType)) {
            return false;
        }
        if (this.constraint && type.constraint) {
            return type.constraint.equals(this.constraint);
        }
        else if (!this.constraint && !type.constraint) {
            return true;
        }
        else {
            return false;
        }
    };
    TypeParameterType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.name = this.name;
        if (this.constraint) {
            result.constraint = this.constraint.toObject();
        }
        return result;
    };
    TypeParameterType.prototype.toString = function () {
        return this.name;
    };
    return TypeParameterType;
}(abstract_1.Type));
exports.TypeParameterType = TypeParameterType;
//# sourceMappingURL=type-parameter.js.map