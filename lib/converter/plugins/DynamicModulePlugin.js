var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("../../models/reflections/abstract");
var base_path_1 = require("../utils/base-path");
var converter_1 = require("../converter");
var plugin_1 = require("../plugin");
var Path = require("path");
var DynamicModulePlugin = (function (_super) {
    __extends(DynamicModulePlugin, _super);
    function DynamicModulePlugin(converter) {
        _super.call(this, converter);
        this.basePath = new base_path_1.BasePath();
        converter.on(converter_1.Converter.EVENT_BEGIN, this.onBegin, this);
        converter.on(converter_1.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
        converter.on(converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
    }
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
    return DynamicModulePlugin;
})(plugin_1.ConverterPlugin);
exports.DynamicModulePlugin = DynamicModulePlugin;
converter_1.Converter.registerPlugin('dynamicModule', DynamicModulePlugin);
