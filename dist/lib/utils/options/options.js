"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Util = require("util");
const ts = require("typescript");
const events_1 = require("../events");
const component_1 = require("../component");
const declaration_1 = require("./declaration");
class OptionsComponent extends component_1.AbstractComponent {
}
exports.OptionsComponent = OptionsComponent;
var OptionsReadMode;
(function (OptionsReadMode) {
    OptionsReadMode[OptionsReadMode["Prefetch"] = 0] = "Prefetch";
    OptionsReadMode[OptionsReadMode["Fetch"] = 1] = "Fetch";
})(OptionsReadMode = exports.OptionsReadMode || (exports.OptionsReadMode = {}));
class DiscoverEvent extends events_1.Event {
    constructor(name, mode) {
        super(name);
        this.inputFiles = [];
        this.errors = [];
        this.mode = mode;
    }
    addInputFile(fileName) {
        this.inputFiles.push(fileName);
    }
    addError(message, ...args) {
        this.errors.push(Util.format.apply(this, arguments));
    }
}
DiscoverEvent.DISCOVER = 'optionsDiscover';
exports.DiscoverEvent = DiscoverEvent;
let Options = class Options extends component_1.ChildableComponent {
    initialize() {
        this.declarations = {};
        this.values = {};
        this.compilerOptions = {
            target: ts.ScriptTarget.ES3,
            module: ts.ModuleKind.None
        };
    }
    read(data = {}, mode = OptionsReadMode.Fetch) {
        const event = new DiscoverEvent(DiscoverEvent.DISCOVER, mode);
        event.data = data;
        this.trigger(event);
        this.setValues(event.data, '', event.addError.bind(event));
        if (mode === OptionsReadMode.Fetch) {
            const logger = this.application.logger;
            for (let error of event.errors) {
                logger.error(error);
            }
        }
        return {
            hasErrors: event.errors.length > 0,
            inputFiles: event.inputFiles
        };
    }
    getValue(name) {
        const declaration = this.getDeclaration(name);
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
    }
    getRawValues() {
        return _.clone(this.values);
    }
    getDeclaration(name) {
        return this.declarations[name.toLowerCase()];
    }
    getDeclarationsByScope(scope) {
        const result = _.values(this.declarations)
            .filter(declaration => declaration.scope === scope);
        return _.uniq(result);
    }
    getCompilerOptions() {
        return this.compilerOptions;
    }
    setValue(name, value, errorCallback) {
        const declaration = name instanceof declaration_1.OptionDeclaration ? name : this.getDeclaration(name);
        if (!declaration) {
            return;
        }
        const key = declaration.name;
        if (declaration.scope === declaration_1.ParameterScope.TypeScript) {
            this.compilerOptions[key] = declaration.convert(value, errorCallback);
        }
        else {
            this.values[key] = declaration.convert(value, errorCallback);
        }
    }
    setValues(obj, prefix = '', errorCallback) {
        for (let key in obj) {
            const value = obj[key];
            const declaration = this.getDeclaration(key);
            const shouldValueBeAnObject = declaration && declaration['map'] === 'object';
            if (!Array.isArray(value) && typeof value === 'object' && !shouldValueBeAnObject) {
                this.setValues(value, prefix + key + '.', errorCallback);
            }
            else {
                this.setValue(prefix + key, value, errorCallback);
            }
        }
    }
    addDeclaration(declaration) {
        const decl = declaration instanceof declaration_1.OptionDeclaration
            ? declaration
            : new declaration_1.OptionDeclaration(declaration);
        for (let name of decl.getNames()) {
            if (name in this.declarations) {
                this.application.logger.error('The option "%s" has already been registered by the "%s" component.', name, this.declarations[name].component || '__unknown');
            }
            else {
                this.declarations[name] = decl;
            }
        }
    }
    addDeclarations(declarations) {
        for (let declaration of declarations) {
            this.addDeclaration(declaration);
        }
    }
    removeDeclaration(declaration) {
        const names = _.keys(this.declarations);
        for (const name of names) {
            if (this.declarations[name] === declaration) {
                delete this.declarations[name];
            }
        }
        if (declaration.name in this.values) {
            delete this.values[declaration.name];
        }
    }
    removeDeclarationByName(name) {
        const declaration = this.getDeclaration(name);
        if (declaration) {
            this.removeDeclaration(declaration);
        }
    }
};
Options = __decorate([
    component_1.Component({ name: 'options', internal: true, childClass: OptionsComponent })
], Options);
exports.Options = Options;
//# sourceMappingURL=options.js.map