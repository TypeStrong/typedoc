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
var converter_1 = require("../converter");
var BindingObjectConverter = (function (_super) {
    __extends(BindingObjectConverter, _super);
    function BindingObjectConverter() {
        _super.apply(this, arguments);
    }
    BindingObjectConverter.prototype.supportsNode = function (context, node) {
        return node.kind == 159;
    };
    BindingObjectConverter.prototype.convertNode = function (context, node) {
        var _this = this;
        var declaration = new index_1.DeclarationReflection();
        declaration.kind = index_1.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;
        context.registerReflection(declaration, null);
        context.trigger(converter_1.Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, function () {
            node.elements.forEach(function (element) {
                _this.owner.convertNode(context, element);
            });
        });
        return new index_1.ReflectionType(declaration);
    };
    BindingObjectConverter = __decorate([
        components_1.Component({ name: 'type:binding-object' }), 
        __metadata('design:paramtypes', [])
    ], BindingObjectConverter);
    return BindingObjectConverter;
})(components_1.ConverterTypeComponent);
exports.BindingObjectConverter = BindingObjectConverter;
