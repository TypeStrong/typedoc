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
var Options_1 = require("../Options");
var context_1 = require("./context");
var components_1 = require("./components");
var compiler_host_1 = require("./utils/compiler-host");
var component_1 = require("../utils/component");
(function (SourceFileMode) {
    SourceFileMode[SourceFileMode["File"] = 0] = "File";
    SourceFileMode[SourceFileMode["Modules"] = 1] = "Modules";
})(exports.SourceFileMode || (exports.SourceFileMode = {}));
var SourceFileMode = exports.SourceFileMode;
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
    Converter.prototype.getParameters = function () {
        return _super.prototype.getParameters.call(this).concat([{
                name: "name",
                help: 'Set the name of the project that will be used in the header of the template.'
            }, {
                name: "mode",
                help: "Specifies the output mode the project is used to be compiled with: 'file' or 'modules'",
                type: Options_1.ParameterType.Map,
                map: {
                    'file': SourceFileMode.File,
                    'modules': SourceFileMode.Modules
                },
                defaultValue: SourceFileMode.Modules
            }, {
                name: "externalPattern",
                help: 'Define a pattern for files that should be considered being external.'
            }, {
                name: "includeDeclarations",
                help: 'Turn on parsing of .d.ts declaration files.',
                type: Options_1.ParameterType.Boolean
            }, {
                name: "excludeExternals",
                help: 'Prevent externally resolved TypeScript files from being documented.',
                type: Options_1.ParameterType.Boolean
            }, {
                name: "excludeNotExported",
                help: 'Prevent symbols that are not exported from being documented.',
                type: Options_1.ParameterType.Boolean
            }]);
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
        for (var _i = 0; _i < keys.length; _i++) {
            var key = keys[_i];
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
        if (this.application.options.verbose) {
            this.application.logger.verbose('\n\x1b[32mStarting conversion\x1b[0m\n\nInput files:');
            for (var i = 0, c = fileNames.length; i < c; i++) {
                this.application.logger.verbose(' - ' + fileNames[i]);
            }
            this.application.logger.verbose('\n');
        }
        for (var i = 0, c = fileNames.length; i < c; i++) {
            fileNames[i] = ts.normalizePath(ts.normalizeSlashes(fileNames[i]));
        }
        var program = ts.createProgram(fileNames, this.application.compilerOptions, this.compilerHost);
        var checker = program.getTypeChecker();
        var context = new context_1.Context(this, fileNames, checker, program);
        this.trigger(Converter.EVENT_BEGIN, context);
        var errors = this.compile(context);
        var project = this.resolve(context);
        this.trigger(Converter.EVENT_END, context);
        if (this.application.options.verbose) {
            this.application.logger.verbose('\n\x1b[32mFinished conversion\x1b[0m\n');
        }
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
        if (context.getOptions().verbose) {
            var file = ts.getSourceFileOfNode(node);
            var pos = ts.getLineAndCharacterOfPosition(file, node.pos);
            if (node.symbol) {
                context.getLogger().verbose('Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)', context.checker.getFullyQualifiedName(node.symbol), file.fileName, pos.line.toString(), pos.character.toString());
            }
            else {
                context.getLogger().verbose('Visiting node of kind %s in %s (%s:%s)', node.kind.toString(), file.fileName, pos.line.toString(), pos.character.toString());
            }
        }
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
        var diagnostics = program.getSyntacticDiagnostics();
        if (diagnostics.length === 0) {
            diagnostics = program.getGlobalDiagnostics();
            if (diagnostics.length === 0) {
                return program.getSemanticDiagnostics();
            }
            else {
                return diagnostics;
            }
        }
        else {
            return diagnostics;
        }
    };
    Converter.prototype.resolve = function (context) {
        this.trigger(Converter.EVENT_RESOLVE_BEGIN, context);
        var project = context.project;
        for (var id in project.reflections) {
            if (!project.reflections.hasOwnProperty(id))
                continue;
            if (this.application.options.verbose) {
                this.application.logger.verbose('Resolving %s', project.reflections[id].getFullName());
            }
            this.trigger(Converter.EVENT_RESOLVE, context, project.reflections[id]);
        }
        this.trigger(Converter.EVENT_RESOLVE_END, context);
        return project;
    };
    Converter.prototype.getDefaultLib = function () {
        var target = this.application.compilerOptions.target;
        return target == 2 ? 'lib.es6.d.ts' : 'lib.d.ts';
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
    Converter = __decorate([
        component_1.Component({ childClass: components_1.ConverterComponent }), 
        __metadata('design:paramtypes', [])
    ], Converter);
    return Converter;
})(component_1.ChildableComponent);
exports.Converter = Converter;
