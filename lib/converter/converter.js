var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Options_1 = require("../Options");
var context_1 = require("./context");
var convert_node_1 = require("./convert-node");
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
    Converter.prototype.compile = function (context) {
        var program = context.program;
        program.getSourceFiles().forEach(function (sourceFile) {
            convert_node_1.convertNode(context, sourceFile);
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
    return Converter;
})(component_1.ConverterHost);
exports.Converter = Converter;
require("./plugins/index");
