"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const ts = require("typescript");
const index_1 = require("../../models/reflections/index");
const index_2 = require("../../models/sources/index");
const components_1 = require("../components");
const base_path_1 = require("../utils/base-path");
const converter_1 = require("../converter");
let SourcePlugin = class SourcePlugin extends components_1.ConverterComponent {
    constructor() {
        super(...arguments);
        this.basePath = new base_path_1.BasePath();
        this.fileMappings = {};
    }
    initialize() {
        this.listenTo(this.owner, {
            [converter_1.Converter.EVENT_BEGIN]: this.onBegin,
            [converter_1.Converter.EVENT_FILE_BEGIN]: this.onBeginDocument,
            [converter_1.Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [converter_1.Converter.EVENT_CREATE_SIGNATURE]: this.onDeclaration,
            [converter_1.Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
            [converter_1.Converter.EVENT_RESOLVE]: this.onResolve,
            [converter_1.Converter.EVENT_RESOLVE_END]: this.onEndResolve
        });
    }
    getSourceFile(fileName, project) {
        if (!this.fileMappings[fileName]) {
            const file = new index_2.SourceFile(fileName);
            this.fileMappings[fileName] = file;
            project.files.push(file);
        }
        return this.fileMappings[fileName];
    }
    onBegin() {
        this.basePath.reset();
        this.fileMappings = {};
    }
    onBeginDocument(context, reflection, node) {
        if (!node) {
            return;
        }
        const fileName = node.fileName;
        this.basePath.add(fileName);
        this.getSourceFile(fileName, context.project);
    }
    onDeclaration(context, reflection, node) {
        if (!node) {
            return;
        }
        const sourceFile = node.getSourceFile();
        const fileName = sourceFile.fileName;
        const file = this.getSourceFile(fileName, context.project);
        let position;
        if (node['name'] && node['name'].end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
        }
        else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        if (!reflection.sources) {
            reflection.sources = [];
        }
        if (reflection instanceof index_1.DeclarationReflection) {
            file.reflections.push(reflection);
        }
        reflection.sources.push({
            file: file,
            fileName: fileName,
            line: position.line + 1,
            character: position.character
        });
    }
    onBeginResolve(context) {
        context.project.files.forEach((file) => {
            const fileName = file.fileName = this.basePath.trim(file.fileName);
            this.fileMappings[fileName] = file;
        });
    }
    onResolve(context, reflection) {
        if (!reflection.sources) {
            return;
        }
        reflection.sources.forEach((source) => {
            source.fileName = this.basePath.trim(source.fileName);
        });
    }
    onEndResolve(context) {
        const project = context.project;
        const home = project.directory;
        project.files.forEach((file) => {
            const reflections = [];
            file.reflections.forEach((reflection) => {
                reflections.push(reflection);
            });
            let directory = home;
            const path = Path.dirname(file.fileName);
            if (path !== '.') {
                path.split('/').forEach((pathPiece) => {
                    if (!Object.prototype.hasOwnProperty.call(directory.directories, pathPiece)) {
                        directory.directories[pathPiece] = new index_2.SourceDirectory(pathPiece, directory);
                    }
                    directory = directory.directories[pathPiece];
                });
            }
            directory.files.push(file);
            file.parent = directory;
            file.reflections = reflections;
        });
    }
};
SourcePlugin = __decorate([
    components_1.Component({ name: 'source' })
], SourcePlugin);
exports.SourcePlugin = SourcePlugin;
//# sourceMappingURL=SourcePlugin.js.map