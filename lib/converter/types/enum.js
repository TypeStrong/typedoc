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
var index_1 = require("../factories/index");
var components_1 = require("../components");
var EnumConverter = (function (_super) {
    __extends(EnumConverter, _super);
    function EnumConverter() {
        _super.apply(this, arguments);
    }
    EnumConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 16);
    };
    EnumConverter.prototype.convertType = function (context, type) {
        return index_1.createReferenceType(context, type.symbol);
    };
    EnumConverter = __decorate([
        components_1.Component({ name: 'type:enum' })
    ], EnumConverter);
    return EnumConverter;
}(components_1.ConverterTypeComponent));
exports.EnumConverter = EnumConverter;
//# sourceMappingURL=enum.js.map