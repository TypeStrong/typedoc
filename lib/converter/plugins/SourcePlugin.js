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
var Path = require("path");
var ts = require("typescript");
var index_1 = require("../../models/reflections/index");
var index_2 = require("../../models/sources/index");
var components_1 = require("../components");
var base_path_1 = require("../utils/base-path");
var converter_1 = require("../converter");
var SourcePlugin = (function (_super) {
    __extends(SourcePlugin, _super);
    function SourcePlugin() {
        _super.apply(this, arguments);
        this.basePath = new base_path_1.BasePath();
        this.fileMappings = {};
    }
    SourcePlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[converter_1.Converter.EVENT_BEGIN] = this.onBegin,
            _a[converter_1.Converter.EVENT_FILE_BEGIN] = this.onBeginDocument,
            _a[converter_1.Converter.EVENT_CREATE_DECLARATION] = this.onDeclaration,
            _a[converter_1.Converter.EVENT_CREATE_SIGNATURE] = this.onDeclaration,
            _a[converter_1.Converter.EVENT_RESOLVE_BEGIN] = this.onBeginResolve,
            _a[converter_1.Converter.EVENT_RESOLVE] = this.onResolve,
            _a[converter_1.Converter.EVENT_RESOLVE_END] = this.onEndResolve,
            _a
        ));
        var _a;
    };
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
    SourcePlugin = __decorate([
        components_1.Component({ name: 'source' })
    ], SourcePlugin);
    return SourcePlugin;
}(components_1.ConverterComponent));
exports.SourcePlugin = SourcePlugin;
//# sourceMappingURL=SourcePlugin.js.map