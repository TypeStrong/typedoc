var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Converter_1 = require("../Converter");
var ConverterPlugin_1 = require("../ConverterPlugin");
var Reflection_1 = require("../../models/Reflection");
var BasePath_1 = require("../BasePath");
var Path = require("path");
var DynamicModulePlugin = (function (_super) {
    __extends(DynamicModulePlugin, _super);
    function DynamicModulePlugin(converter) {
        _super.call(this, converter);
        this.basePath = new BasePath_1.BasePath();
        converter.on(Converter_1.Converter.EVENT_BEGIN, this.onBegin, this);
        converter.on(Converter_1.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
    }
    DynamicModulePlugin.prototype.onBegin = function (context) {
        this.basePath.reset();
        this.reflections = [];
    };
    DynamicModulePlugin.prototype.onDeclaration = function (context, reflection, node) {
        if (reflection.kindOf(Reflection_1.ReflectionKind.ExternalModule)) {
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
})(ConverterPlugin_1.ConverterPlugin);
exports.DynamicModulePlugin = DynamicModulePlugin;
Converter_1.Converter.registerPlugin('dynamicModule', DynamicModulePlugin);
