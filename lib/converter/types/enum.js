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
var index_1 = require("../factories/index");
var components_1 = require("../components");
var EnumConverter = (function (_super) {
    __extends(EnumConverter, _super);
    function EnumConverter() {
        _super.apply(this, arguments);
    }
    EnumConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & 128);
    };
    EnumConverter.prototype.convertType = function (context, type) {
        return index_1.createReferenceType(context, type.symbol);
    };
    EnumConverter = __decorate([
        components_1.Component({ name: 'type:enum' }), 
        __metadata('design:paramtypes', [])
    ], EnumConverter);
    return EnumConverter;
})(components_1.ConverterTypeComponent);
exports.EnumConverter = EnumConverter;
