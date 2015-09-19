/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */
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
var FS = require("fs");
var typescript = require("typescript");
var minimatch_1 = require("minimatch");
var loggers_1 = require("./utils/loggers");
var fs_1 = require("./utils/fs");
var index_1 = require("./models/index");
var index_2 = require("./converter/index");
var Renderer_1 = require("./output/Renderer");
var component_1 = require("./utils/component");
var index_3 = require("./utils/options/index");
var declaration_1 = require("./utils/options/declaration");
var plugins_1 = require("./utils/plugins");
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(options) {
        _super.call(this, null);
        this.logger = new loggers_1.ConsoleLogger();
        this.converter = this.addComponent('converter', index_2.Converter);
        this.renderer = this.addComponent('renderer', Renderer_1.Renderer);
        this.plugins = this.addComponent('plugins', plugins_1.Plugins);
        this.options = this.addComponent('options', index_3.Options);
        this.bootstrap(options);
    }
    Application.prototype.bootstrap = function (options) {
        this.options.read(options, index_3.OptionsReadMode.Prefetch);
        var logger = this.loggerType;
        if (typeof logger == 'function') {
            this.logger = new loggers_1.CallbackLogger(logger);
        }
        else if (logger == 'none') {
            this.logger = new loggers_1.Logger();
        }
        this.plugins.load();
        return this.options.read(options, index_3.OptionsReadMode.Fetch);
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
        var project = input instanceof index_1.ProjectReflection ? input : this.convert(input);
        if (!project)
            return false;
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
        var project = input instanceof index_1.ProjectReflection ? input : this.convert(input);
        if (!project)
            return false;
        out = Path.resolve(out);
        fs_1.writeFile(out, JSON.stringify(project.toObject(), null, '\t'), false);
        this.logger.success('JSON written to %s', out);
        return true;
    };
    Application.prototype.expandInputFiles = function (inputFiles) {
        var exclude, files = [];
        if (this.exclude) {
            exclude = new minimatch_1.Minimatch(this.exclude);
        }
        function add(dirname) {
            FS.readdirSync(dirname).forEach(function (file) {
                var realpath = Path.join(dirname, file);
                if (FS.statSync(realpath).isDirectory()) {
                    add(realpath);
                }
                else if (/\.ts$/.test(realpath)) {
                    if (exclude && exclude.match(realpath.replace(/\\/g, '/'))) {
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
            else {
                files.push(file);
            }
        });
        return files;
    };
    Application.prototype.toString = function () {
        return [
            '',
            'TypeDoc ' + Application.VERSION,
            'Using TypeScript ' + this.getTypeScriptVersion() + ' from ' + this.getTypeScriptPath(),
            ''
        ].join(typescript.sys.newLine);
    };
    Application.VERSION = '{{ VERSION }}';
    __decorate([
        component_1.Option({
            name: 'logger',
            help: 'Specify the logger that should be used, \'none\' or \'console\'',
            defaultValue: 'console',
            type: declaration_1.ParameterType.Mixed,
        }), 
        __metadata('design:type', Object)
    ], Application.prototype, "loggerType");
    __decorate([
        component_1.Option({
            name: 'ignoreCompilerErrors',
            help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
            type: declaration_1.ParameterType.Boolean
        }), 
        __metadata('design:type', Boolean)
    ], Application.prototype, "ignoreCompilerErrors");
    __decorate([
        component_1.Option({
            name: 'exclude',
            help: 'Define a pattern for excluded files when specifying paths.',
            type: declaration_1.ParameterType.String
        }), 
        __metadata('design:type', String)
    ], Application.prototype, "exclude");
    Application = __decorate([
        component_1.Component({ name: "application", internal: true }), 
        __metadata('design:paramtypes', [Object])
    ], Application);
    return Application;
})(component_1.ChildableComponent);
exports.Application = Application;
