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
var index_2 = require("../factories/index");
var components_1 = require("../components");
var AliasConverter = (function (_super) {
    __extends(AliasConverter, _super);
    function AliasConverter() {
        _super.apply(this, arguments);
        this.supports = [
            214
        ];
    }
    AliasConverter.prototype.convert = function (context, node) {
        var _this = this;
        var alias = index_2.createDeclaration(context, node, index_1.ReflectionKind.TypeAlias);
        context.withScope(alias, function () {
            alias.type = _this.owner.convertType(context, node.type, context.getTypeAtLocation(node.type));
        });
        return alias;
    };
    AliasConverter = __decorate([
        components_1.Component({ name: 'node:alias' }), 
        __metadata('design:paramtypes', [])
    ], AliasConverter);
    return AliasConverter;
})(components_1.ConverterNodeComponent);
exports.AliasConverter = AliasConverter;
