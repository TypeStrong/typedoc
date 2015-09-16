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
var ModuleConverter = (function (_super) {
    __extends(ModuleConverter, _super);
    function ModuleConverter() {
        _super.apply(this, arguments);
        this.supports = [
            216
        ];
    }
    ModuleConverter.prototype.convert = function (context, node) {
        var _this = this;
        var parent = context.scope;
        var reflection = index_2.createDeclaration(context, node, index_1.ReflectionKind.Module);
        context.withScope(reflection, function () {
            var opt = context.getCompilerOptions();
            if (parent instanceof index_1.ProjectReflection && !context.isDeclaration &&
                (!opt.module || opt.module == 0)) {
                reflection.setFlag(index_1.ReflectionFlag.Exported);
            }
            if (node.body) {
                _this.owner.convertNode(context, node.body);
            }
        });
        return reflection;
    };
    ModuleConverter = __decorate([
        components_1.Component({ name: 'node:module' }), 
        __metadata('design:paramtypes', [])
    ], ModuleConverter);
    return ModuleConverter;
})(components_1.ConverterNodeComponent);
exports.ModuleConverter = ModuleConverter;
