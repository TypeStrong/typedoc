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
var IntersectionType = (function (_super) {
    __extends(IntersectionType, _super);
    function IntersectionType(types) {
        var _this = _super.call(this) || this;
        _this.type = 'intersection';
        _this.types = types;
        return _this;
    }
    IntersectionType.prototype.clone = function () {
        return new IntersectionType(this.types);
    };
    IntersectionType.prototype.equals = function (type) {
        if (!(type instanceof IntersectionType)) {
            return false;
        }
        return abstract_1.Type.isTypeListSimiliar(type.types, this.types);
    };
    IntersectionType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.types && this.types.length) {
            result.types = this.types.map(function (e) { return e.toObject(); });
        }
        return result;
    };
    IntersectionType.prototype.toString = function () {
        var names = [];
        this.types.forEach(function (element) {
            names.push(element.toString());
        });
        return names.join(' & ');
    };
    return IntersectionType;
}(abstract_1.Type));
exports.IntersectionType = IntersectionType;
//# sourceMappingURL=intersection.js.map