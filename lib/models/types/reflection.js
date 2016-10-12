"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var ReflectionType = (function (_super) {
    __extends(ReflectionType, _super);
    function ReflectionType(declaration) {
        _super.call(this);
        this.declaration = declaration;
    }
    ReflectionType.prototype.clone = function () {
        var clone = new ReflectionType(this.declaration);
        clone.isArray = this.isArray;
        return clone;
    };
    ReflectionType.prototype.equals = function (type) {
        return type == this;
    };
    ReflectionType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.type = 'reflection';
        if (this.declaration) {
            result.declaration = this.declaration.toObject();
        }
        return result;
    };
    ReflectionType.prototype.toString = function () {
        if (!this.declaration.children && this.declaration.signatures) {
            return 'function';
        }
        else {
            return 'object';
        }
    };
    return ReflectionType;
}(abstract_1.Type));
exports.ReflectionType = ReflectionType;
//# sourceMappingURL=reflection.js.map