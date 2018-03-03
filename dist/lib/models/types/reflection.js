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
var ReflectionType = (function (_super) {
    __extends(ReflectionType, _super);
    function ReflectionType(declaration) {
        var _this = _super.call(this) || this;
        _this.type = 'reflection';
        _this.declaration = declaration;
        return _this;
    }
    ReflectionType.prototype.clone = function () {
        return new ReflectionType(this.declaration);
    };
    ReflectionType.prototype.equals = function (type) {
        return type === this;
    };
    ReflectionType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
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