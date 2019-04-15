"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Converter_1;
const ts = require("typescript");
const _ = require("lodash");
const declaration_1 = require("../utils/options/declaration");
const context_1 = require("./context");
const components_1 = require("./components");
const component_1 = require("../utils/component");
const fs_1 = require("../utils/fs");
const paths_1 = require("../utils/paths");
let Converter = Converter_1 = class Converter extends component_1.ChildableComponent {
    initialize() {
        this.nodeConverters = {};
        this.typeTypeConverters = [];
        this.typeNodeConverters = [];
    }
    addComponent(name, componentClass) {
        const component = super.addComponent(name, componentClass);
        if (component instanceof components_1.ConverterNodeComponent) {
            this.addNodeConverter(component);
        }
        else if (component instanceof components_1.ConverterTypeComponent) {
            this.addTypeConverter(component);
        }
        return component;
    }
    addNodeConverter(converter) {
        for (let supports of converter.supports) {
            this.nodeConverters[supports] = converter;
        }
    }
    addTypeConverter(converter) {
        if ('supportsNode' in converter && 'convertNode' in converter) {
            this.typeNodeConverters.push(converter);
            this.typeNodeConverters.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        if ('supportsType' in converter && 'convertType' in converter) {
            this.typeTypeConverters.push(converter);
            this.typeTypeConverters.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
    }
    removeComponent(name) {
        const component = super.removeComponent(name);
        if (component instanceof components_1.ConverterNodeComponent) {
            this.removeNodeConverter(component);
        }
        else if (component instanceof components_1.ConverterTypeComponent) {
            this.removeTypeConverter(component);
        }
        return component;
    }
    removeNodeConverter(converter) {
        const converters = this.nodeConverters;
        const keys = _.keys(this.nodeConverters);
        for (let key of keys) {
            if (converters[key] === converter) {
                delete converters[key];
            }
        }
    }
    removeTypeConverter(converter) {
        const typeIndex = this.typeTypeConverters.indexOf(converter);
        if (typeIndex !== -1) {
            this.typeTypeConverters.splice(typeIndex, 1);
        }
        const nodeIndex = this.typeNodeConverters.indexOf(converter);
        if (nodeIndex !== -1) {
            this.typeNodeConverters.splice(nodeIndex, 1);
        }
    }
    removeAllComponents() {
        super.removeAllComponents();
        this.nodeConverters = {};
        this.typeTypeConverters = [];
        this.typeNodeConverters = [];
    }
    convert(fileNames) {
        const normalizedFiles = fileNames.map(fs_1.normalizePath);
        const program = ts.createProgram(normalizedFiles, this.application.options.getCompilerOptions());
        const checker = program.getTypeChecker();
        const context = new context_1.Context(this, normalizedFiles, checker, program);
        this.trigger(Converter_1.EVENT_BEGIN, context);
        const errors = this.compile(context);
        const project = this.resolve(context);
        this.trigger(Converter_1.EVENT_END, context);
        return {
            errors: errors,
            project: project
        };
    }
    convertNode(context, node) {
        if (context.visitStack.includes(node)) {
            return;
        }
        const oldVisitStack = context.visitStack;
        context.visitStack = oldVisitStack.slice();
        context.visitStack.push(node);
        let result;
        if (node.kind in this.nodeConverters) {
            result = this.nodeConverters[node.kind].convert(context, node);
        }
        context.visitStack = oldVisitStack;
        return result;
    }
    convertType(context, node, type) {
        if (node) {
            type = type || context.getTypeAtLocation(node);
            for (let converter of this.typeNodeConverters) {
                if (converter.supportsNode(context, node, type)) {
                    return converter.convertNode(context, node, type);
                }
            }
        }
        if (type) {
            for (let converter of this.typeTypeConverters) {
                if (converter.supportsType(context, type)) {
                    return converter.convertType(context, type);
                }
            }
        }
    }
    convertTypes(context, nodes = [], types = []) {
        const result = [];
        _.zip(nodes, types).forEach(([node, type]) => {
            const converted = this.convertType(context, node, type);
            if (converted) {
                result.push(converted);
            }
        });
        return result;
    }
    compile(context) {
        const program = context.program;
        const exclude = paths_1.createMinimatch(this.application.exclude || []);
        const isExcluded = (file) => exclude.some(mm => mm.match(file.fileName));
        const includedSourceFiles = program.getSourceFiles()
            .filter(file => !isExcluded(file));
        const isRelevantError = ({ file }) => !file || includedSourceFiles.includes(file);
        includedSourceFiles.forEach((sourceFile) => {
            this.convertNode(context, sourceFile);
        });
        let diagnostics = program.getOptionsDiagnostics().filter(isRelevantError);
        if (diagnostics.length) {
            return diagnostics;
        }
        diagnostics = program.getSyntacticDiagnostics().filter(isRelevantError);
        if (diagnostics.length) {
            return diagnostics;
        }
        diagnostics = program.getGlobalDiagnostics().filter(isRelevantError);
        if (diagnostics.length) {
            return diagnostics;
        }
        diagnostics = program.getSemanticDiagnostics().filter(isRelevantError);
        if (diagnostics.length) {
            return diagnostics;
        }
        return [];
    }
    resolve(context) {
        this.trigger(Converter_1.EVENT_RESOLVE_BEGIN, context);
        const project = context.project;
        for (let id in project.reflections) {
            if (!project.reflections.hasOwnProperty(id)) {
                continue;
            }
            this.trigger(Converter_1.EVENT_RESOLVE, context, project.reflections[id]);
        }
        this.trigger(Converter_1.EVENT_RESOLVE_END, context);
        return project;
    }
    getDefaultLib() {
        return ts.getDefaultLibFileName(this.application.options.getCompilerOptions());
    }
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
        name: 'name',
        help: 'Set the name of the project that will be used in the header of the template.'
    })
], Converter.prototype, "name", void 0);
__decorate([
    component_1.Option({
        name: 'externalPattern',
        help: 'Define patterns for files that should be considered being external.',
        type: declaration_1.ParameterType.Array
    })
], Converter.prototype, "externalPattern", void 0);
__decorate([
    component_1.Option({
        name: 'includeDeclarations',
        help: 'Turn on parsing of .d.ts declaration files.',
        type: declaration_1.ParameterType.Boolean
    })
], Converter.prototype, "includeDeclarations", void 0);
__decorate([
    component_1.Option({
        name: 'excludeExternals',
        help: 'Prevent externally resolved TypeScript files from being documented.',
        type: declaration_1.ParameterType.Boolean
    })
], Converter.prototype, "excludeExternals", void 0);
__decorate([
    component_1.Option({
        name: 'excludeNotExported',
        help: 'Prevent symbols that are not exported from being documented.',
        type: declaration_1.ParameterType.Boolean
    })
], Converter.prototype, "excludeNotExported", void 0);
__decorate([
    component_1.Option({
        name: 'excludePrivate',
        help: 'Ignores private variables and methods',
        type: declaration_1.ParameterType.Boolean
    })
], Converter.prototype, "excludePrivate", void 0);
__decorate([
    component_1.Option({
        name: 'excludeProtected',
        help: 'Ignores protected variables and methods',
        type: declaration_1.ParameterType.Boolean
    })
], Converter.prototype, "excludeProtected", void 0);
Converter = Converter_1 = __decorate([
    component_1.Component({ name: 'converter', internal: true, childClass: components_1.ConverterComponent })
], Converter);
exports.Converter = Converter;
//# sourceMappingURL=converter.js.map