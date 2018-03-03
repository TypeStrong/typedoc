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
var _ = require("lodash");
var Util = require("util");
var ts = require("typescript");
var events_1 = require("../events");
var component_1 = require("../component");
var declaration_1 = require("./declaration");
var OptionsComponent = (function (_super) {
    __extends(OptionsComponent, _super);
    function OptionsComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionsComponent;
}(component_1.AbstractComponent));
exports.OptionsComponent = OptionsComponent;
var OptionsReadMode;
(function (OptionsReadMode) {
    OptionsReadMode[OptionsReadMode["Prefetch"] = 0] = "Prefetch";
    OptionsReadMode[OptionsReadMode["Fetch"] = 1] = "Fetch";
})(OptionsReadMode = exports.OptionsReadMode || (exports.OptionsReadMode = {}));
var DiscoverEvent = (function (_super) {
    __extends(DiscoverEvent, _super);
    function DiscoverEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputFiles = [];
        _this.errors = [];
        return _this;
    }
    DiscoverEvent.prototype.addInputFile = function (fileName) {
        this.inputFiles.push(fileName);
    };
    DiscoverEvent.prototype.addError = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.errors.push(Util.format.apply(this, arguments));
    };
    DiscoverEvent.DISCOVER = 'optionsDiscover';
    return DiscoverEvent;
}(events_1.Event));
exports.DiscoverEvent = DiscoverEvent;
var Options = (function (_super) {
    __extends(Options, _super);
    function Options() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Options.prototype.initialize = function () {
        this.declarations = {};
        this.values = {};
        this.compilerOptions = {
            target: ts.ScriptTarget.ES3,
            module: ts.ModuleKind.None
        };
    };
    Options.prototype.read = function (data, mode) {
        if (data === void 0) { data = {}; }
        if (mode === void 0) { mode = OptionsReadMode.Fetch; }
        var event = new DiscoverEvent(DiscoverEvent.DISCOVER);
        event.data = data;
        event.mode = mode;
        this.trigger(event);
        this.setValues(event.data, '', event.addError.bind(event));
        if (mode === OptionsReadMode.Fetch) {
            var logger = this.application.logger;
            for (var _i = 0, _a = event.errors; _i < _a.length; _i++) {
                var error = _a[_i];
                logger.error(error);
            }
        }
        return {
            hasErrors: event.errors.length > 0,
            inputFiles: event.inputFiles
        };
    };
    Options.prototype.getValue = function (name) {
        var declaration = this.getDeclaration(name);
        if (!declaration) {
            throw new Error(Util.format('Unknown option `%s`.', name));
        }
        if (declaration.scope === declaration_1.ParameterScope.TypeScript) {
            throw new Error('TypeScript options cannot be fetched using `getValue`, use `getCompilerOptions` instead.');
        }
        if (name in this.values) {
            return this.values[name];
        }
        else {
            return declaration.defaultValue;
        }
    };
    Options.prototype.getRawValues = function () {
        return _.clone(this.values);
    };
    Options.prototype.getDeclaration = function (name) {
        name = name.toLowerCase();
        if (name in this.declarations) {
            return this.declarations[name];
        }
    };
    Options.prototype.getDeclarationsByScope = function (scope) {
        var result = [];
        for (var name_1 in this.declarations) {
            var declaration = this.declarations[name_1];
            if (declaration.scope === scope) {
                result.push(declaration);
            }
        }
        return _.uniq(result);
    };
    Options.prototype.getCompilerOptions = function () {
        return this.compilerOptions;
    };
    Options.prototype.setValue = function (name, value, errorCallback) {
        var declaration = name instanceof declaration_1.OptionDeclaration ? name : this.getDeclaration(name);
        if (!declaration) {
            return;
        }
        var key = declaration.name;
        if (declaration.scope === declaration_1.ParameterScope.TypeScript) {
            this.compilerOptions[key] = declaration.convert(value, errorCallback);
        }
        else {
            this.values[key] = declaration.convert(value, errorCallback);
        }
    };
    Options.prototype.setValues = function (obj, prefix, errorCallback) {
        if (prefix === void 0) { prefix = ''; }
        for (var key in obj) {
            var value = obj[key];
            var declaration = this.getDeclaration(key);
            var shouldValueBeAnObject = declaration && declaration['map'] === 'object';
            if (!Array.isArray(value) && typeof value === 'object' && !shouldValueBeAnObject) {
                this.setValues(value, prefix + key + '.', errorCallback);
            }
            else {
                this.setValue(prefix + key, value, errorCallback);
            }
        }
    };
    Options.prototype.addDeclaration = function (declaration) {
        var decl;
        if (!(declaration instanceof declaration_1.OptionDeclaration)) {
            decl = new declaration_1.OptionDeclaration(declaration);
        }
        else {
            decl = declaration;
        }
        for (var _i = 0, _a = decl.getNames(); _i < _a.length; _i++) {
            var name_2 = _a[_i];
            if (name_2 in this.declarations) {
                this.application.logger.error('The option "%s" has already been registered by the "%s" component.', name_2, this.declarations[name_2].component);
            }
            else {
                this.declarations[name_2] = decl;
            }
        }
    };
    Options.prototype.addDeclarations = function (declarations) {
        for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
            var declaration = declarations_1[_i];
            this.addDeclaration(declaration);
        }
    };
    Options.prototype.removeDeclaration = function (declaration) {
        var names = _.keys(this.declarations);
        var name;
        for (name in names) {
            if (this.declarations[name] === declaration) {
                delete this.declarations[name];
            }
        }
        name = declaration.name;
        if (name in this.values) {
            delete this.values[name];
        }
    };
    Options.prototype.removeDeclarationByName = function (name) {
        var declaration = this.getDeclaration(name);
        if (declaration) {
            this.removeDeclaration(declaration);
        }
    };
    Options = __decorate([
        component_1.Component({ name: 'options', internal: true, childClass: OptionsComponent })
    ], Options);
    return Options;
}(component_1.ChildableComponent));
exports.Options = Options;
//# sourceMappingURL=options.js.map