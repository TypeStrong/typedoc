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
var UnionConverter = (function (_super) {
    __extends(UnionConverter, _super);
    function UnionConverter() {
        _super.apply(this, arguments);
    }
    UnionConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 162;
    };
    UnionConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 524288);
    };
    UnionConverter.prototype.convertNode = function (context, node) {
        var _this = this;
        var types = [];
        if (node.types) {
            types = node.types.map(function (n) { return _this.owner.convertType(context, n); });
        }
        else {
            types = [];
        }
        return new index_1.UnionType(types);
    };
    UnionConverter.prototype.convertType = function (context, type) {
        var _this = this;
        var types;
        if (type && type.types) {
            types = type.types.map(function (t) { return _this.owner.convertType(context, null, t); });
        }
        else {
            types = [];
        }
        return new index_1.UnionType(types);
    };
    UnionConverter = __decorate([
        components_1.Component({ name: 'type:union' })
    ], UnionConverter);
    return UnionConverter;
}(components_1.ConverterTypeComponent));
exports.UnionConverter = UnionConverter;
//# sourceMappingURL=union.js.map