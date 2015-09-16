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
var components_1 = require("../components");
var TypeLiteralConverter = (function (_super) {
    __extends(TypeLiteralConverter, _super);
    function TypeLiteralConverter() {
        _super.apply(this, arguments);
        this.supports = [
            153
        ];
    }
    TypeLiteralConverter.prototype.convert = function (context, node) {
        var _this = this;
        if (node.members) {
            node.members.forEach(function (node) {
                _this.owner.convertNode(context, node);
            });
        }
        return context.scope;
    };
    TypeLiteralConverter = __decorate([
        components_1.Component({ name: 'node:literal-type' }), 
        __metadata('design:paramtypes', [])
    ], TypeLiteralConverter);
    return TypeLiteralConverter;
})(components_1.ConverterNodeComponent);
exports.TypeLiteralConverter = TypeLiteralConverter;
