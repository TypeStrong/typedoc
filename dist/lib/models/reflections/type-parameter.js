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
var TypeParameterReflection = (function (_super) {
    __extends(TypeParameterReflection, _super);
    function TypeParameterReflection(parent, type) {
        var _this = _super.call(this, parent, type.name, abstract_1.ReflectionKind.TypeParameter) || this;
        _this.type = type.constraint;
        return _this;
    }
    TypeParameterReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.type) {
            result.type = this.type.toObject();
        }
        return result;
    };
    return TypeParameterReflection;
}(abstract_1.Reflection));
exports.TypeParameterReflection = TypeParameterReflection;
//# sourceMappingURL=type-parameter.js.map