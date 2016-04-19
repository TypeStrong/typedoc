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
var ts = require("typescript");
var declaration_1 = require("../utils/options/declaration");
var context_1 = require("./context");
var components_1 = require("./components");
var compiler_host_1 = require("./utils/compiler-host");
var component_1 = require("../utils/component");
var Converter = (function (_super) {
    __extends(Converter, _super);
    function Converter() {
        _super.apply(this, arguments);
    }
    Converter.prototype.initialize = function () {
        this.compilerHost = new compiler_host_1.CompilerHost(this);
        this.nodeConverters = {};
        this.typeTypeConverters = [];
        this.typeNodeConverters = [];
    };
    Converter.prototype.addComponent = function (name, componentClass) {
        var component = _super.prototype.addComponent.call(this, name, componentClass);
        if (component instanceof components_1.ConverterNodeComponent) {
            this.addNodeConverter(component);
        }
        else if (component instanceof components_1.ConverterTypeComponent) {
            this.addTypeConverter(component);
        }
        return component;
    };
    Converter.prototype.addNodeConverter = function (converter) {
        for (var _i = 0, _a = converter.supports; _i < _a.length; _i++) {
            var supports = _a[_i];
            this.nodeConverters[supports] = converter;
        }
    };
    Converter.prototype.addTypeConverter = function (converter) {
        if ("supportsNode" in converter && "convertNode" in converter) {
            this.typeNodeConverters.push(converter);
            this.typeNodeConverters.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
        }
        if ("supportsType" in converter && "convertType" in converter) {
            this.typeTypeConverters.push(converter);
            this.typeTypeConverters.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
        }
    };
    Converter.prototype.removeComponent = function (name) {
        var component = _super.prototype.removeComponent.call(this, name);
        if (component instanceof components_1.ConverterNodeComponent) {
            this.removeNodeConverter(component);
        }
        else if (component instanceof components_1.ConverterTypeComponent) {
            this.removeTypeConverter(component);
        }
        return component;
    };
    Converter.prototype.removeNodeConverter = function (converter) {
        var converters = this.nodeConverters;
        var keys = _.keys(this.nodeConverters);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (converters[key] === converter) {
                delete converters[key];
            }
        }
    };
    Converter.prototype.removeTypeConverter = function (converter) {
        var index = this.typeNodeConverters.indexOf(converter);
        if (index != -1) {
            this.typeTypeConverters.splice(index, 1);
        }
        index = this.typeNodeConverters.indexOf(converter);
        if (index != -1) {
            this.typeNodeConverters.splice(index, 1);
        }
    };
    Converter.prototype.removeAllComponents = function () {
        _super.prototype.removeAllComponents.call(this);
        this.nodeConverters = {};
        this.typeTypeConverters = [];
        this.typeNodeConverters = [];
    };
    Converter.prototype.convert = function (fileNames) {
        for (var i = 0, c = fileNames.length; i < c; i++) {
            fileNames[i] = ts.normalizePath(ts.normalizeSlashes(fileNames[i]));
        }
        var program = ts.createProgram(fileNames, this.application.options.getCompilerOptions(), this.compilerHost);
        var checker = program.getTypeChecker();
        var context = new context_1.Context(this, fileNames, checker, program);
        this.trigger(Converter.EVENT_BEGIN, context);
        var errors = this.compile(context);
        var project = this.resolve(context);
        this.trigger(Converter.EVENT_END, context);
        return {
            errors: errors,
            project: project
        };
    };
    Converter.prototype.convertNode = function (context, node) {
        if (context.visitStack.indexOf(node) != -1) {
            return null;
        }
        var oldVisitStack = context.visitStack;
        context.visitStack = oldVisitStack.slice();
        context.visitStack.push(node);
        var result;
        if (node.kind in this.nodeConverters) {
            result = this.nodeConverters[node.kind].convert(context, node);
        }
        context.visitStack = oldVisitStack;
        return result;
    };
    Converter.prototype.convertType = function (context, node, type) {
        if (node) {
            type = type || context.getTypeAtLocation(node);
            for (var _i = 0, _a = this.typeNodeConverters; _i < _a.length; _i++) {
                var converter = _a[_i];
                if (converter.supportsNode(context, node, type)) {
                    return converter.convertNode(context, node, type);
                }
            }
        }
        if (type) {
            for (var _b = 0, _c = this.typeTypeConverters; _b < _c.length; _b++) {
                var converter = _c[_b];
                if (converter.supportsType(context, type)) {
                    return converter.convertType(context, type);
                }
            }
        }
    };
    Converter.prototype.compile = function (context) {
        var _this = this;
        var program = context.program;
        program.getSourceFiles().forEach(function (sourceFile) {
            _this.convertNode(context, sourceFile);
        });
        var diagnostics = program.getOptionsDiagnostics();
        if (diagnostics.length)
            return diagnostics;
        diagnostics = program.getSyntacticDiagnostics();
        if (diagnostics.length)
            return diagnostics;
        diagnostics = program.getGlobalDiagnostics();
        if (diagnostics.length)
            return diagnostics;
        diagnostics = program.getSemanticDiagnostics();
        if (diagnostics.length)
            return diagnostics;
        return [];
    };
    Converter.prototype.resolve = function (context) {
        this.trigger(Converter.EVENT_RESOLVE_BEGIN, context);
        var project = context.project;
        for (var id in project.reflections) {
            if (!project.reflections.hasOwnProperty(id))
                continue;
            this.trigger(Converter.EVENT_RESOLVE, context, project.reflections[id]);
        }
        this.trigger(Converter.EVENT_RESOLVE_END, context);
        return project;
    };
    Converter.prototype.getDefaultLib = function () {
        return ts.getDefaultLibFileName(this.application.options.getCompilerOptions());
    };
    Converter.EVENT_BEGIN = 'begin';
    Converter.EVENT_END = 'end';
    Converter.EVENT_FILE_BEGIN = 'fileBegin';
    Converter.EVENT_CREATE_DECLARATION = 'createDeclaration';
    Converter.EVENT_CREATE_SIGNATURE = 'createSignature';
    Converter.EVENT_CREATE_PARAMETER = 'createParameter';
    Converter.EVENT_CREATE_TYPE_PARAMETER = 'createTypeParameter';
    Converter.EVENT_FUNCTION_IMPLEMENTATION = 'functionImplementation';
    Converter.EVENT_RESOLVE_BEGIN = 'resolveBegin';
    Converter.EVENT_RESOLVE = 'resolveReflection';
    Converter.EVENT_RESOLVE_END = 'resolveEnd';
    __decorate([
        component_1.Option({
            name: "name",
            help: "Set the name of the project that will be used in the header of the template."
        })
    ], Converter.prototype, "name", void 0);
    __decorate([
        component_1.Option({
            name: "externalPattern",
            help: 'Define a pattern for files that should be considered being external.'
        })
    ], Converter.prototype, "externalPattern", void 0);
    __decorate([
        component_1.Option({
            name: "includeDeclarations",
            help: 'Turn on parsing of .d.ts declaration files.',
            type: declaration_1.ParameterType.Boolean
        })
    ], Converter.prototype, "includeDeclarations", void 0);
    __decorate([
        component_1.Option({
            name: "excludeExternals",
            help: 'Prevent externally resolved TypeScript files from being documented.',
            type: declaration_1.ParameterType.Boolean
        })
    ], Converter.prototype, "excludeExternals", void 0);
    __decorate([
        component_1.Option({
            name: "excludeNotExported",
            help: 'Prevent symbols that are not exported from being documented.',
            type: declaration_1.ParameterType.Boolean
        })
    ], Converter.prototype, "excludeNotExported", void 0);
    Converter = __decorate([
        component_1.Component({ name: "converter", internal: true, childClass: components_1.ConverterComponent })
    ], Converter);
    return Converter;
}(component_1.ChildableComponent));
exports.Converter = Converter;
