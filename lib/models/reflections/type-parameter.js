"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var TypeParameterReflection = (function (_super) {
    __extends(TypeParameterReflection, _super);
    function TypeParameterReflection(parent, type) {
        _super.call(this, parent, type.name, abstract_1.ReflectionKind.TypeParameter);
        this.type = type.constraint;
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