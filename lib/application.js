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
var LinkParser_1 = require("./utils/LinkParser");
var _ = require("underscore");
var marked = require("marked");
var highlight = require("highlight.js");
var Path = require("path");
var FS = require("fs");
var typescript = require("typescript");
var minimatch_1 = require("minimatch");
var index_1 = require("./converter/index");
var renderer_1 = require("./output/renderer");
var index_2 = require("./models/index");
var index_3 = require("./utils/index");
var component_1 = require("./utils/component");
var index_4 = require("./utils/options/index");
var declaration_1 = require("./utils/options/declaration");
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(options) {
        _super.call(this, null);
        this.logger = new index_3.ConsoleLogger();
        this.converter = this.addComponent('converter', index_1.Converter);
        this.renderer = this.addComponent('renderer', renderer_1.Renderer);
        this.plugins = this.addComponent('plugins', index_3.PluginHost);
        this.options = this.addComponent('options', index_4.Options);
        this.bootstrap(options);
    }
    Application.prototype.bootstrap = function (options) {
        this.options.read(options, index_4.OptionsReadMode.Prefetch);
        var logger = this.loggerType;
        if (typeof logger == 'function') {
            this.logger = new index_3.CallbackLogger(logger);
        }
        else if (logger == 'none') {
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
    Application.prototype.generateJson = function (input, out, linkPrefix) {
        var project = input instanceof index_2.ProjectReflection ? input : this.convert(input);
        if (!project)
            return false;
        out = Path.resolve(out);
        var obj = project.toObject();
        index_3.writeFile(out, JSON.stringify(this.prettifyJson(obj.children, project, linkPrefix), null, '\t'), false);
        this.logger.success('JSON written to %s', out);
        return true;
    };
    Application.prototype.prettifyJson = function (obj, project, linkPrefix) {
        var getHighlighted = function (text, lang) {
            try {
                if (lang) {
                    return highlight.highlight(lang, text).value;
                }
                else {
                    return highlight.highlightAuto(text).value;
                }
            }
            catch (error) {
                this.application.logger.warn(error.message);
                return text;
            }
        };
        marked.setOptions({
            highlight: function (code, lang) {
                return getHighlighted(code, lang);
            }
        });
        var linkParser = new LinkParser_1.LinkParser(project, linkPrefix);
        var nodeList = [];
        var visitChildren = function (json, path) {
            _.each(_.keys(json), function (key) {
                var str = json[key];
                if (str != null && str.name != null && str.comment != null) {
                    var comment = str.comment;
                    if (comment.shortText != null) {
                        var markedText = marked(comment.shortText + (comment.text ? '\n' + comment.text : ''));
                        var type = '';
                        var constrainedValues = this.generateConstrainedValues(str);
                        if (str.type && str.type.name) {
                            type = str.type.name;
                        }
                        nodeList.push({ name: path + str.name, comment: linkParser.parseMarkdown(markedText), type: type, constrainedValues: constrainedValues });
                    }
                    if (str.children != null && str.children.length > 0) {
                        visitChildren(str.children, path + str.name + '.');
                    }
                }
            });
        };
        visitChildren(obj, '');
        return nodeList;
    };
    Application.prototype.generateConstrainedValues = function (str) {
        var constrainedValues = [];
        if (str && str['type'] && str['type'].type == 'union') {
            if (str.type.types[0] && str.type.types[0].typeArguments && str.type.types[0].typeArguments[0]) {
                constrainedValues = str.type.types[0].typeArguments[0].types.map(function (type) {
                    return type.value;
                });
                if (str.type.types[0].name && str.type.types[0].name.toLowerCase() == 'array') {
                    var copy = [];
                    for (var i = 0; i < constrainedValues.length; i++) {
                        copy[i] = constrainedValues.slice(0, i + 1).join(',');
                    }
                    constrainedValues = copy;
                }
                constrainedValues = constrainedValues.slice(0, 4);
            }
        }
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
                else if (/\.tsx?$/.test(realpath)) {
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
            help: 'Define a pattern for excluded files when specifying paths.',
            type: declaration_1.ParameterType.String
        })
    ], Application.prototype, "exclude", void 0);
    Application = __decorate([
        component_1.Component({ name: "application", internal: true })
    ], Application);
    return Application;
}(component_1.ChildableComponent));
exports.Application = Application;
