var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var Converter_1 = require("../Converter");
var ConverterPlugin_1 = require("../ConverterPlugin");
var BasePath_1 = require("../BasePath");
var SourceFile_1 = require("../../models/SourceFile");
var SourceDirectory_1 = require("../../models/SourceDirectory");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var SourcePlugin = (function (_super) {
    __extends(SourcePlugin, _super);
    function SourcePlugin(converter) {
        _super.call(this, converter);
        this.basePath = new BasePath_1.BasePath();
        this.fileMappings = {};
        converter.on(Converter_1.Converter.EVENT_BEGIN, this.onBegin, this);
        converter.on(Converter_1.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
        converter.on(Converter_1.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
        converter.on(Converter_1.Converter.EVENT_CREATE_SIGNATURE, this.onDeclaration, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE, this.onResolve, this);
        converter.on(Converter_1.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
    }
    SourcePlugin.prototype.getSourceFile = function (fileName, project) {
        if (!this.fileMappings[fileName]) {
            var file = new SourceFile_1.SourceFile(fileName);
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
        if (reflection instanceof DeclarationReflection_1.DeclarationReflection) {
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
                        directory.directories[path] = new SourceDirectory_1.SourceDirectory(path, directory);
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
})(ConverterPlugin_1.ConverterPlugin);
exports.SourcePlugin = SourcePlugin;
Converter_1.Converter.registerPlugin('source', SourcePlugin);
