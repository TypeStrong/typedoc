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
var UnknownType = (function (_super) {
    __extends(UnknownType, _super);
    function UnknownType(name) {
        var _this = _super.call(this) || this;
        _this.type = 'unknown';
        _this.name = name;
        return _this;
    }
    UnknownType.prototype.clone = function () {
        return new UnknownType(this.name);
    };
    UnknownType.prototype.equals = function (type) {
        return type instanceof UnknownType &&
            type.name === this.name;
    };
    UnknownType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.name = this.name;
        return result;
    };
    UnknownType.prototype.toString = function () {
        return this.name;
    };
    return UnknownType;
}(abstract_1.Type));
exports.UnknownType = UnknownType;
//# sourceMappingURL=unknown.js.map