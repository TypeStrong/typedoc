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
var ArrayConverter = (function (_super) {
    __extends(ArrayConverter, _super);
    function ArrayConverter() {
        _super.apply(this, arguments);
    }
    ArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 160;
    };
    ArrayConverter.prototype.convertNode = function (context, node) {
        var result = this.owner.convertType(context, node.elementType);
        if (result) {
            result.isArray = true;
        }
        else {
            result = new index_1.IntrinsicType('Array');
        }
        return result;
    };
    ArrayConverter = __decorate([
        components_1.Component({ name: 'type:array' })
    ], ArrayConverter);
    return ArrayConverter;
}(components_1.ConverterTypeComponent));
exports.ArrayConverter = ArrayConverter;
//# sourceMappingURL=array.js.map