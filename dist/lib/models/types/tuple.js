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
var TupleType = (function (_super) {
    __extends(TupleType, _super);
    function TupleType(elements) {
        var _this = _super.call(this) || this;
        _this.type = 'tuple';
        _this.elements = elements;
        return _this;
    }
    TupleType.prototype.clone = function () {
        return new TupleType(this.elements);
    };
    TupleType.prototype.equals = function (type) {
        if (!(type instanceof TupleType)) {
            return false;
        }
        return abstract_1.Type.isTypeListEqual(type.elements, this.elements);
    };
    TupleType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.elements && this.elements.length) {
            result.elements = this.elements.map(function (e) { return e.toObject(); });
        }
        return result;
    };
    TupleType.prototype.toString = function () {
        var names = [];
        this.elements.forEach(function (element) {
            names.push(element.toString());
        });
        return '[' + names.join(', ') + ']';
    };
    return TupleType;
}(abstract_1.Type));
exports.TupleType = TupleType;
//# sourceMappingURL=tuple.js.map