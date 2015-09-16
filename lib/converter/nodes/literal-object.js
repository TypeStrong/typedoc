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
var ObjectLiteralConverter = (function (_super) {
    __extends(ObjectLiteralConverter, _super);
    function ObjectLiteralConverter() {
        _super.apply(this, arguments);
        this.supports = [
            163
        ];
    }
    ObjectLiteralConverter.prototype.convert = function (context, node) {
        var _this = this;
        if (node.properties) {
            node.properties.forEach(function (node) {
                _this.owner.convertNode(context, node);
            });
        }
        return context.scope;
    };
    ObjectLiteralConverter = __decorate([
        components_1.Component({ name: 'node:literal-object' }), 
        __metadata('design:paramtypes', [])
    ], ObjectLiteralConverter);
    return ObjectLiteralConverter;
})(components_1.ConverterNodeComponent);
exports.ObjectLiteralConverter = ObjectLiteralConverter;
