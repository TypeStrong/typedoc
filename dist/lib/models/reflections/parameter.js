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
var index_1 = require("../types/index");
var abstract_1 = require("./abstract");
var ParameterReflection = (function (_super) {
    __extends(ParameterReflection, _super);
    function ParameterReflection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParameterReflection.prototype.traverse = function (callback) {
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        _super.prototype.traverse.call(this, callback);
    };
    ParameterReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.type) {
            result.type = this.type.toObject();
        }
        if (this.defaultValue) {
            result.defaultValue = this.defaultValue;
        }
        return result;
    };
    ParameterReflection.prototype.toString = function () {
        return _super.prototype.toString.call(this) + (this.type ? ':' + this.type.toString() : '');
    };
    return ParameterReflection;
}(abstract_1.Reflection));
exports.ParameterReflection = ParameterReflection;
//# sourceMappingURL=parameter.js.map