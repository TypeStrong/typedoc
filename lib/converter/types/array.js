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
var index_1 = require("../../models/index");
var components_1 = require("../components");
var ArrayConverter = (function (_super) {
    __extends(ArrayConverter, _super);
    function ArrayConverter() {
        _super.apply(this, arguments);
    }
    ArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === 154;
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
        components_1.Component({ name: 'type:array' }), 
        __metadata('design:paramtypes', [])
    ], ArrayConverter);
    return ArrayConverter;
})(components_1.ConverterTypeComponent);
exports.ArrayConverter = ArrayConverter;
