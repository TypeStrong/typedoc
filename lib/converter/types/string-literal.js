var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ts = require("typescript");
var index_1 = require("../../models/types/index");
var components_1 = require("../components");
var StringLiteralConverter = (function (_super) {
    __extends(StringLiteralConverter, _super);
    function StringLiteralConverter() {
        _super.apply(this, arguments);
    }
    StringLiteralConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 9;
    };
    StringLiteralConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 256);
    };
    StringLiteralConverter.prototype.convertNode = function (context, node) {
        return new index_1.StringLiteralType(node.text);
    };
    StringLiteralConverter.prototype.convertType = function (context, type) {
        return new index_1.StringLiteralType(type.text);
    };
    StringLiteralConverter = __decorate([
        components_1.Component({ name: 'type:string-literal' }), 
        __metadata('design:paramtypes', [])
    ], StringLiteralConverter);
    return StringLiteralConverter;
})(components_1.ConverterTypeComponent);
exports.StringLiteralConverter = StringLiteralConverter;
