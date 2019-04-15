"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paths_1 = require("../utils/paths");
const index_1 = require("../models/index");
const type_parameter_1 = require("./factories/type-parameter");
const converter_1 = require("./converter");
class Context {
    constructor(converter, fileNames, checker, program) {
        this.symbolID = -1024;
        this.converter = converter;
        this.fileNames = fileNames;
        this.checker = checker;
        this.program = program;
        this.visitStack = [];
        const project = new index_1.ProjectReflection(converter.name);
        this.project = project;
        this.scope = project;
        if (converter.externalPattern) {
            this.externalPattern = paths_1.createMinimatch(converter.externalPattern);
        }
    }
    getCompilerOptions() {
        return this.converter.application.options.getCompilerOptions();
    }
    getTypeAtLocation(node) {
        let nodeType;
        try {
            nodeType = this.checker.getTypeAtLocation(node);
        }
        catch (error) {
        }
        if (!nodeType) {
            if (node.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.symbol);
            }
            else if (node.parent && node.parent.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.parent.symbol);
            }
            else if (node.parent && node.parent.parent && node.parent.parent.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.parent.parent.symbol);
            }
        }
        return nodeType;
    }
    getLogger() {
        return this.converter.application.logger;
    }
    getSymbolID(symbol) {
        if (!symbol) {
            return;
        }
        if (!symbol.id) {
            symbol.id = this.symbolID--;
        }
        return symbol.id;
    }
    registerReflection(reflection, node, symbol) {
        this.project.reflections[reflection.id] = reflection;
        const id = this.getSymbolID(symbol ? symbol : (node ? node.symbol : undefined));
        if (!this.isInherit && id && !this.project.symbolMapping[id]) {
            this.project.symbolMapping[id] = reflection.id;
        }
    }
    trigger(name, reflection, node) {
        this.converter.trigger(name, this, reflection, node);
    }
    withSourceFile(node, callback) {
        let isExternal = !this.fileNames.includes(node.fileName);
        if (!isExternal && this.externalPattern) {
            isExternal = this.externalPattern.some(mm => mm.match(node.fileName));
        }
        if (isExternal && this.converter.excludeExternals) {
            return;
        }
        let isDeclaration = node.isDeclarationFile;
        if (isDeclaration) {
            const lib = this.converter.getDefaultLib();
            const isLib = node.fileName.substr(-lib.length) === lib;
            if (!this.converter.includeDeclarations || isLib) {
                return;
            }
        }
        this.isExternal = isExternal;
        this.isDeclaration = isDeclaration;
        this.trigger(converter_1.Converter.EVENT_FILE_BEGIN, this.project, node);
        callback();
        this.isExternal = false;
        this.isDeclaration = false;
    }
    withScope(scope, ...args) {
        if (!scope || !args.length) {
            return;
        }
        const callback = args.pop();
        const parameters = args.shift();
        const oldScope = this.scope;
        const oldTypeArguments = this.typeArguments;
        const oldTypeParameters = this.typeParameters;
        this.scope = scope;
        this.typeParameters = parameters ? this.extractTypeParameters(parameters, args.length > 0) : this.typeParameters;
        this.typeArguments = undefined;
        callback();
        this.scope = oldScope;
        this.typeParameters = oldTypeParameters;
        this.typeArguments = oldTypeArguments;
    }
    inherit(baseNode, typeArguments) {
        const wasInherit = this.isInherit;
        const oldInherited = this.inherited;
        const oldInheritParent = this.inheritParent;
        const oldTypeArguments = this.typeArguments;
        this.isInherit = true;
        this.inheritParent = baseNode;
        this.inherited = [];
        const target = this.scope;
        if (!(target instanceof index_1.ContainerReflection)) {
            throw new Error('Expected container reflection');
        }
        if (baseNode.symbol) {
            const id = this.getSymbolID(baseNode.symbol);
            if (this.inheritedChildren && this.inheritedChildren.includes(id)) {
                return target;
            }
            else {
                this.inheritedChildren = this.inheritedChildren || [];
                this.inheritedChildren.push(id);
            }
        }
        if (target.children) {
            this.inherited = target.children.map((c) => c.name);
        }
        else {
            this.inherited = [];
        }
        if (typeArguments) {
            this.typeArguments = this.converter.convertTypes(this, typeArguments);
        }
        else {
            this.typeArguments = undefined;
        }
        this.converter.convertNode(this, baseNode);
        this.isInherit = wasInherit;
        this.inherited = oldInherited;
        this.inheritParent = oldInheritParent;
        this.typeArguments = oldTypeArguments;
        if (!this.isInherit) {
            delete this.inheritedChildren;
        }
        return target;
    }
    extractTypeParameters(parameters, preserve) {
        const typeParameters = {};
        if (preserve) {
            Object.keys(this.typeParameters || {}).forEach(key => {
                typeParameters[key] = this.typeParameters[key];
            });
        }
        parameters.forEach((declaration, index) => {
            if (!declaration.symbol) {
                return;
            }
            const name = declaration.symbol.name;
            if (this.typeArguments && this.typeArguments[index]) {
                typeParameters[name] = this.typeArguments[index];
            }
            else {
                const param = type_parameter_1.createTypeParameter(this, declaration);
                if (param) {
                    typeParameters[name] = param;
                }
            }
        });
        return typeParameters;
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map