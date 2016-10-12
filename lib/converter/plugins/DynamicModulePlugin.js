"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Path = require("path");
var abstract_1 = require("../../models/reflections/abstract");
var components_1 = require("../components");
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
        components_1.Component({ name: 'dynamic-module' })
    ], DynamicModulePlugin);
    return DynamicModulePlugin;
}(components_1.ConverterComponent));
exports.DynamicModulePlugin = DynamicModulePlugin;
//# sourceMappingURL=DynamicModulePlugin.js.map