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
var Path = require("path");
var abstract_1 = require("../../models/reflections/abstract");
var component_1 = require("../../utils/component");
var base_path_1 = require("../utils/base-path");
var converter_1 = require("../converter");
var DynamicModulePlugin = (function (_super) {
    __extends(DynamicModulePlugin, _super);
    function DynamicModulePlugin() {
        _super.apply(this, arguments);
        this.basePath = new base_path_1.BasePath();
    }
    DynamicModulePlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[converter_1.Converter.EVENT_BEGIN] = this.onBegin,
            _a[converter_1.Converter.EVENT_CREATE_DECLARATION] = this.onDeclaration,
            _a[converter_1.Converter.EVENT_RESOLVE_BEGIN] = this.onBeginResolve,
            _a
        ));
        var _a;
    };
    DynamicModulePlugin.prototype.onBegin = function (context) {
        this.basePath.reset();
        this.reflections = [];
    };
    DynamicModulePlugin.prototype.onDeclaration = function (context, reflection, node) {
        if (reflection.kindOf(abstract_1.ReflectionKind.ExternalModule)) {
            var name = reflection.name;
            if (name.indexOf('/') == -1) {
                return;
            }
            name = name.replace(/"/g, '');
            this.reflections.push(reflection);
            this.basePath.add(name);
        }
    };
    DynamicModulePlugin.prototype.onBeginResolve = function (context) {
        var _this = this;
        this.reflections.forEach(function (reflection) {
            var name = reflection.name.replace(/"/g, '');
            name = name.substr(0, name.length - Path.extname(name).length);
            reflection.name = '"' + _this.basePath.trim(name) + '"';
        });
    };
    DynamicModulePlugin = __decorate([
        component_1.Component('dynamicModule'), 
        __metadata('design:paramtypes', [])
    ], DynamicModulePlugin);
    return DynamicModulePlugin;
})(component_1.ConverterComponent);
exports.DynamicModulePlugin = DynamicModulePlugin;
