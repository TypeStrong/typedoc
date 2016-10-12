"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ts = require("typescript");
var index_1 = require("../../models/types/index");
var components_1 = require("../components");
var TupleConverter = (function (_super) {
    __extends(TupleConverter, _super);
    function TupleConverter() {
        _super.apply(this, arguments);
    }
    TupleConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 161;
    };
    TupleConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 262144);
    };
    TupleConverter.prototype.convertNode = function (context, node) {
        var _this = this;
        var elements;
        if (node.elementTypes) {
            elements = node.elementTypes.map(function (n) { return _this.owner.convertType(context, n); });
        }
        else {
            elements = [];
        }
        return new index_1.TupleType(elements);
    };
    TupleConverter.prototype.convertType = function (context, type) {
        var _this = this;
        var elements;
        if (type.typeArguments) {
            elements = type.typeArguments.map(function (t) { return _this.owner.convertType(context, null, t); });
        }
        else {
            elements = [];
        }
        return new index_1.TupleType(elements);
    };
    TupleConverter = __decorate([
        components_1.Component({ name: 'type:tuple' })
    ], TupleConverter);
    return TupleConverter;
}(components_1.ConverterTypeComponent));
exports.TupleConverter = TupleConverter;
//# sourceMappingURL=tuple.js.map