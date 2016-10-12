"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var TupleType = (function (_super) {
    __extends(TupleType, _super);
    function TupleType(elements) {
        _super.call(this);
        this.elements = elements;
    }
    TupleType.prototype.clone = function () {
        var clone = new TupleType(this.elements);
        clone.isArray = this.isArray;
        return clone;
    };
    TupleType.prototype.equals = function (type) {
        if (!(type instanceof TupleType))
            return false;
        if (type.isArray != this.isArray)
            return false;
        return abstract_1.Type.isTypeListEqual(type.elements, this.elements);
    };
    TupleType.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        result.type = 'tuple';
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