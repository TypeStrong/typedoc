"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs");
var typescript = require("typescript");
var minimatch_1 = require("minimatch");
var index_1 = require("./converter/index");
var renderer_1 = require("./output/renderer");
var serialization_1 = require("./serialization");
var index_2 = require("./models/index");
var index_3 = require("./utils/index");
var component_1 = require("./utils/component");
var index_4 = require("./utils/options/index");
var declaration_1 = require("./utils/options/declaration");
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(options) {
        var _this = _super.call(this, null) || this;
        _this.logger = new index_3.ConsoleLogger();
        _this.converter = _this.addComponent('converter', index_1.Converter);
        _this.serializer = _this.addComponent('serializer', serialization_1.Serializer);
        _this.renderer = _this.addComponent('renderer', renderer_1.Renderer);
        _this.plugins = _this.addComponent('plugins', index_3.PluginHost);
        _this.options = _this.addComponent('options', index_4.Options);
        _this.bootstrap(options);
        return _this;
    }
    Application_1 = Application;
    Application.prototype.bootstrap = function (options) {
        this.options.read(options, index_4.OptionsReadMode.Prefetch);
        var logger = this.loggerType;
        if (typeof logger === 'function') {
            this.logger = new index_3.CallbackLogger(logger);
        }
        else if (logger === 'none') {
            this.logger = new index_3.Logger();
        }
        this.plugins.load();
        return this.options.read(options, index_4.OptionsReadMode.Fetch);
    };
    Object.defineProperty(Application.prototype, "application", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "isCLI", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Application.prototype.getTypeScriptPath = function () {
        return Path.dirname(require.resolve('typescript'));
    };
    Application.prototype.getTypeScriptVersion = function () {
        var tsPath = this.getTypeScriptPath();
        var json = JSON.parse(FS.readFileSync(Path.join(tsPath, '..', 'package.json'), 'utf8'));
        return json.version;
    };
    Application.prototype.convert = function (src) {
        this.logger.writeln('Using TypeScript %s from %s', this.getTypeScriptVersion(), this.getTypeScriptPath());
        var result = this.converter.convert(src);
        if (result.errors && result.errors.length) {
            this.logger.diagnostics(result.errors);
            if (this.ignoreCompilerErrors) {
                this.logger.resetErrors();
                return result.project;
            }
            else {
                return null;
            }
        }
        else {
            return result.project;
        }
    };
    Application.prototype.generateDocs = function (input, out) {
        var project = input instanceof index_2.ProjectReflection ? input : this.convert(input);
        if (!project) {
            return false;
        }
        out = Path.resolve(out);
        this.renderer.render(project, out);
        if (this.logger.hasErrors()) {
            this.logger.error('Documentation could not be generated due to the errors above.');
        }
        else {
            this.logger.success('Documentation generated at %s', out);
        }
        return true;
    };
    Application.prototype.generateJson = function (input, out) {
        var project = input instanceof index_2.ProjectReflection ? input : this.convert(input);
        if (!project) {
            return false;
        }
        out = Path.resolve(out);
        var eventData = { outputDirectory: Path.dirname(out), outputFile: Path.basename(out) };
        var ser = this.serializer.projectToObject(project, { begin: eventData, end: eventData });
        index_3.writeFile(out, JSON.stringify(ser, null, '\t'), false);
        this.logger.success('JSON written to %s', out);
        return true;
    };
    Application.prototype.expandInputFiles = function (inputFiles) {
        var files = [];
        var exclude = this.exclude ? this.exclude.map(function (pattern) { return new minimatch_1.Minimatch(pattern); }) : [];
        function isExcluded(fileName) {
            return exclude.some(function (mm) { return mm.match(fileName); });
        }
        function add(dirname) {
            FS.readdirSync(dirname).forEach(function (file) {
                var realpath = Path.join(dirname, file);
                if (FS.statSync(realpath).isDirectory()) {
                    add(realpath);
                }
                else if (/\.tsx?$/.test(realpath)) {
                    if (isExcluded(realpath.replace(/\\/g, '/'))) {
                        return;
                    }
                    files.push(realpath);
                }
            });
        }
        inputFiles.forEach(function (file) {
            file = Path.resolve(file);
            if (FS.statSync(file).isDirectory()) {
                add(file);
            }
            else if (!isExcluded(file)) {
                files.push(file);
            }
        });
        return files;
    };
    Application.prototype.toString = function () {
        return [
            '',
            'TypeDoc ' + Application_1.VERSION,
            'Using TypeScript ' + this.getTypeScriptVersion() + ' from ' + this.getTypeScriptPath(),
            ''
        ].join(typescript.sys.newLine);
    };
    Application.VERSION = '0.10.0';
    __decorate([
        component_1.Option({
            name: 'logger',
            help: 'Specify the logger that should be used, \'none\' or \'console\'',
            defaultValue: 'console',
            type: declaration_1.ParameterType.Mixed
        })
    ], Application.prototype, "loggerType", void 0);
    __decorate([
        component_1.Option({
            name: 'ignoreCompilerErrors',
            help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
            type: declaration_1.ParameterType.Boolean
        })
    ], Application.prototype, "ignoreCompilerErrors", void 0);
    __decorate([
        component_1.Option({
            name: 'exclude',
            help: 'Define patterns for excluded files when specifying paths.',
            type: declaration_1.ParameterType.Array
        })
    ], Application.prototype, "exclude", void 0);
    Application = Application_1 = __decorate([
        component_1.Component({ name: 'application', internal: true })
    ], Application);
    return Application;
    var Application_1;
}(component_1.ChildableComponent));
exports.Application = Application;
//# sourceMappingURL=application.js.map