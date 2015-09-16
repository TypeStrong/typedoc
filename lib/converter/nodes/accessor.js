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
var AccessorConverter = (function (_super) {
    __extends(AccessorConverter, _super);
    function AccessorConverter() {
        _super.apply(this, arguments);
        this.supports = [
            143,
            144
        ];
    }
    AccessorConverter.prototype.convert = function (context, node) {
        var accessor = index_2.createDeclaration(context, node, index_1.ReflectionKind.Accessor);
        context.withScope(accessor, function () {
            if (node.kind == 143) {
                accessor.getSignature = index_2.createSignature(context, node, '__get', index_1.ReflectionKind.GetSignature);
            }
            else {
                accessor.setSignature = index_2.createSignature(context, node, '__set', index_1.ReflectionKind.SetSignature);
            }
        });
        return accessor;
    };
    AccessorConverter = __decorate([
        components_1.Component({ name: 'node:accessor' }), 
        __metadata('design:paramtypes', [])
    ], AccessorConverter);
    return AccessorConverter;
})(components_1.ConverterNodeComponent);
exports.AccessorConverter = AccessorConverter;
