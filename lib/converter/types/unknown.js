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
var index_1 = require("../../models/types/index");
var components_1 = require("../components");
var UnknownConverter = (function (_super) {
    __extends(UnknownConverter, _super);
    function UnknownConverter() {
        _super.apply(this, arguments);
        this.priority = -100;
    }
    UnknownConverter.prototype.supportsType = function (context, type) {
        return true;
    };
    UnknownConverter.prototype.convertType = function (context, type) {
        var name = context.checker.typeToString(type);
        return new index_1.UnknownType(name);
    };
    UnknownConverter = __decorate([
        components_1.Component({ name: 'type:unknown' })
    ], UnknownConverter);
    return UnknownConverter;
}(components_1.ConverterTypeComponent));
exports.UnknownConverter = UnknownConverter;
//# sourceMappingURL=unknown.js.map