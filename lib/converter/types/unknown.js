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
        components_1.Component({ name: 'type:unknown' }), 
        __metadata('design:paramtypes', [])
    ], UnknownConverter);
    return UnknownConverter;
})(components_1.ConverterTypeComponent);
exports.UnknownConverter = UnknownConverter;
