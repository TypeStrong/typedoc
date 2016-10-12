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
var index_1 = require("../../models/index");
var components_1 = require("../components");
var IntrinsicConverter = (function (_super) {
    __extends(IntrinsicConverter, _super);
    function IntrinsicConverter() {
        _super.apply(this, arguments);
    }
    IntrinsicConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 16015);
    };
    IntrinsicConverter.prototype.convertType = function (context, type) {
        return new index_1.IntrinsicType(type.intrinsicName);
    };
    IntrinsicConverter = __decorate([
        components_1.Component({ name: 'type:intrinsic' })
    ], IntrinsicConverter);
    return IntrinsicConverter;
}(components_1.ConverterTypeComponent));
exports.IntrinsicConverter = IntrinsicConverter;
//# sourceMappingURL=intrinsic.js.map