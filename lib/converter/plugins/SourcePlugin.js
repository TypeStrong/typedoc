var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var ts = require("typescript");
var index_1 = require("../../models/reflections/index");
var index_2 = require("../../models/sources/index");
var base_path_1 = require("../utils/base-path");
var converter_1 = require("../converter");
var plugin_1 = require("../plugin");
var SourcePlugin = (function (_super) {
    __extends(SourcePlugin, _super);
    function SourcePlugin(converter) {
        _super.call(this, converter);
        this.basePath = new base_path_1.BasePath();
        this.fileMappings = {};
        converter.on(converter_1.Converter.EVENT_BEGIN, this.onBegin, this);
        converter.on(converter_1.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
        converter.on(converter_1.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
        converter.on(converter_1.Converter.EVENT_CREATE_SIGNATURE, this.onDeclaration, this);
        converter.on(converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
        converter.on(converter_1.Converter.EVENT_RESOLVE, this.onResolve, this);
        converter.on(converter_1.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
    }
    SourcePlugin.prototype.getSourceFile = function (fileName, project) {
        if (!this.fileMappings[fileName]) {
            var file = new index_2.SourceFile(fileName);
            this.fileMappings[fileName] = file;
            project.files.push(file);
        }
        return this.fileMappings[fileName];
    };
    SourcePlugin.prototype.onBegin = function () {
        this.basePath.reset();
        this.fileMappings = {};
    };
    SourcePlugin.prototype.onBeginDocument = function (context, reflection, node) {
        if (!node)
            return;
        var fileName = node.fileName;
        this.basePath.add(fileName);
        this.getSourceFile(fileName, context.project);
    };
    SourcePlugin.prototype.onDeclaration = function (context, reflection, node) {
        if (!node)
            return;
        var sourceFile = ts.getSourceFileOfNode(node);
        var fileName = sourceFile.fileName;
        var file = this.getSourceFile(fileName, context.project);
        var position;
        if (node['name'] && node['name'].end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
        }
        else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        if (!reflection.sources)
            reflection.sources = [];
        if (reflection instanceof index_1.DeclarationReflection) {
            file.reflections.push(reflection);
        }
        reflection.sources.push({
            file: file,
            fileName: fileName,
            line: position.line + 1,
            character: position.character
        });
    };
    SourcePlugin.prototype.onBeginResolve = function (context) {
        var _this = this;
        context.project.files.forEach(function (file) {
            var fileName = file.fileName = _this.basePath.trim(file.fileName);
            _this.fileMappings[fileName] = file;
        });
    };
    SourcePlugin.prototype.onResolve = function (context, reflection) {
        var _this = this;
        if (!reflection.sources)
            return;
        reflection.sources.forEach(function (source) {
            source.fileName = _this.basePath.trim(source.fileName);
        });
    };
    SourcePlugin.prototype.onEndResolve = function (context) {
        var project = context.project;
        var home = project.directory;
        project.files.forEach(function (file) {
            var reflections = [];
            file.reflections.forEach(function (reflection) {
                reflections.push(reflection);
            });
            var directory = home;
            var path = Path.dirname(file.fileName);
            if (path != '.') {
                path.split('/').forEach(function (path) {
                    if (!directory.directories[path]) {
                        directory.directories[path] = new index_2.SourceDirectory(path, directory);
                    }
                    directory = directory.directories[path];
                });
            }
            directory.files.push(file);
            file.parent = directory;
            file.reflections = reflections;
        });
    };
    return SourcePlugin;
})(plugin_1.ConverterPlugin);
exports.SourcePlugin = SourcePlugin;
converter_1.Converter.registerPlugin('source', SourcePlugin);
