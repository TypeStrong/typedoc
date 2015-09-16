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
var TypeParameterConverter = (function (_super) {
    __extends(TypeParameterConverter, _super);
    function TypeParameterConverter() {
        _super.apply(this, arguments);
        this.priority = -50;
    }
    TypeParameterConverter.prototype.supportsNode = function (context, node, type) {
        return !!(type.flags & 512);
    };
    TypeParameterConverter.prototype.convertNode = function (context, node) {
        if (node.typeName) {
            var name = ts.getTextOfNode(node.typeName);
            if (context.typeParameters && context.typeParameters[name]) {
                return context.typeParameters[name].clone();
            }
            var result = new index_1.TypeParameterType();
            result.name = name;
            return result;
        }
    };
    TypeParameterConverter = __decorate([
        components_1.Component({ name: 'type:type-parameter' }), 
        __metadata('design:paramtypes', [])
    ], TypeParameterConverter);
    return TypeParameterConverter;
})(components_1.ConverterTypeComponent);
exports.TypeParameterConverter = TypeParameterConverter;
