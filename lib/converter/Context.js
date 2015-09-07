var ts = require("typescript");
var Converter_1 = require("./Converter");
var ProjectReflection_1 = require("../models/reflections/ProjectReflection");
var ContainerReflection_1 = require("../models/reflections/ContainerReflection");
var convertNode_1 = require("./converters/convertNode");
var convertType_1 = require("./converters/convertType");
var factories_1 = require("./converters/factories");
var minimatch_1 = require("minimatch");
var Context = (function () {
    function Context(converter, fileNames, checker, program) {
        this.symbolID = -1024;
        this.converter = converter;
        this.fileNames = fileNames;
        this.checker = checker;
        this.program = program;
        this.visitStack = [];
        var project = new ProjectReflection_1.ProjectReflection(this.getOptions().name);
        this.project = project;
        this.scope = project;
        var options = converter.application.options;
        if (options.externalPattern) {
            this.externalPattern = new minimatch_1.Minimatch(options.externalPattern);
        }
    }
    Context.prototype.getOptions = function () {
        return this.converter.application.options;
    };
    Context.prototype.getCompilerOptions = function () {
        return this.converter.application.compilerOptions;
    };
    Context.prototype.getTypeAtLocation = function (node) {
        try {
            return this.checker.getTypeAtLocation(node);
        }
        catch (error) {
            try {
                if (node.symbol) {
                    return this.checker.getDeclaredTypeOfSymbol(node.symbol);
                }
            }
            catch (error) { }
        }
        return null;
    };
    Context.prototype.getLogger = function () {
        return this.converter.application.logger;
    };
    Context.prototype.getSymbolID = function (symbol) {
        if (!symbol)
            return null;
        if (!symbol.id)
            symbol.id = this.symbolID--;
        return symbol.id;
    };
    Context.prototype.registerReflection = function (reflection, node, symbol) {
        this.project.reflections[reflection.id] = reflection;
        var id = this.getSymbolID(symbol ? symbol : (node ? node.symbol : null));
        if (!this.isInherit && id && !this.project.symbolMapping[id]) {
            this.project.symbolMapping[id] = reflection.id;
        }
    };
    Context.prototype.trigger = function (name, reflection, node) {
        this.converter.dispatch(name, this, reflection, node);
    };
    Context.prototype.withSourceFile = function (node, callback) {
        var options = this.converter.application.options;
        var externalPattern = this.externalPattern;
        var isExternal = this.fileNames.indexOf(node.fileName) == -1;
        if (externalPattern) {
            isExternal = isExternal || externalPattern.match(node.fileName);
        }
        if (isExternal && options.excludeExternals) {
            return;
        }
        var isDeclaration = ts.isDeclarationFile(node);
        if (isDeclaration) {
            var lib = this.converter.getDefaultLib();
            var isLib = node.fileName.substr(-lib.length) == lib;
            if (!options.includeDeclarations || isLib) {
                return;
            }
        }
        this.isExternal = isExternal;
        this.isDeclaration = isDeclaration;
        this.trigger(Converter_1.Converter.EVENT_FILE_BEGIN, this.project, node);
        callback();
        this.isExternal = false;
        this.isDeclaration = false;
    };
    Context.prototype.withScope = function (scope) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!scope || !args.length)
            return;
        var callback = args.pop();
        var parameters = args.shift();
        var oldScope = this.scope;
        var oldTypeArguments = this.typeArguments;
        var oldTypeParameters = this.typeParameters;
        this.scope = scope;
        this.typeParameters = parameters ? this.extractTypeParameters(parameters, args.length > 0) : this.typeParameters;
        this.typeArguments = null;
        callback();
        this.scope = oldScope;
        this.typeParameters = oldTypeParameters;
        this.typeArguments = oldTypeArguments;
    };
    Context.prototype.inherit = function (baseNode, typeArguments) {
        var _this = this;
        var wasInherit = this.isInherit;
        var oldInherited = this.inherited;
        var oldInheritParent = this.inheritParent;
        var oldTypeArguments = this.typeArguments;
        this.isInherit = true;
        this.inheritParent = baseNode;
        this.inherited = [];
        var target = this.scope;
        if (!(target instanceof ContainerReflection_1.ContainerReflection)) {
            throw new Error('Expected container reflection');
        }
        if (baseNode.symbol) {
            var id = this.getSymbolID(baseNode.symbol);
            if (this.inheritedChildren && this.inheritedChildren.indexOf(id) != -1) {
                return target;
            }
            else {
                this.inheritedChildren = this.inheritedChildren || [];
                this.inheritedChildren.push(id);
            }
        }
        if (target.children) {
            this.inherited = target.children.map(function (c) { return c.name; });
        }
        else {
            this.inherited = [];
        }
        if (typeArguments) {
            this.typeArguments = typeArguments.map(function (t) { return convertType_1.convertType(_this, t); });
        }
        else {
            this.typeArguments = null;
        }
        convertNode_1.visit(this, baseNode);
        this.isInherit = wasInherit;
        this.inherited = oldInherited;
        this.inheritParent = oldInheritParent;
        this.typeArguments = oldTypeArguments;
        if (!this.isInherit) {
            delete this.inheritedChildren;
        }
        return target;
    };
    Context.prototype.extractTypeParameters = function (parameters, preserve) {
        var _this = this;
        var typeParameters = {};
        if (preserve) {
            for (var key in this.typeParameters) {
                if (!this.typeParameters.hasOwnProperty(key))
                    continue;
                typeParameters[key] = this.typeParameters[key];
            }
        }
        parameters.forEach(function (declaration, index) {
            var name = declaration.symbol.name;
            if (_this.typeArguments && _this.typeArguments[index]) {
                typeParameters[name] = _this.typeArguments[index];
            }
            else {
                typeParameters[name] = factories_1.createTypeParameter(_this, declaration);
            }
        });
        return typeParameters;
    };
    return Context;
})();
exports.Context = Context;
