"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TSConfigReader_1;
const Path = require("path");
const FS = require("fs");
const _ = require("lodash");
const ts = require("typescript");
const component_1 = require("../../component");
const options_1 = require("../options");
const declaration_1 = require("../declaration");
const typescript_1 = require("../sources/typescript");
let TSConfigReader = TSConfigReader_1 = class TSConfigReader extends options_1.OptionsComponent {
    initialize() {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -100);
    }
    onDiscover(event) {
        if (event.mode !== options_1.OptionsReadMode.Fetch) {
            return;
        }
        let file;
        if (TSConfigReader_1.OPTIONS_KEY in event.data) {
            const tsconfig = event.data[TSConfigReader_1.OPTIONS_KEY];
            if (FS.existsSync(tsconfig) && FS.statSync(tsconfig).isFile()) {
                file = Path.resolve(tsconfig);
            }
            else {
                file = ts.findConfigFile(tsconfig, ts.sys.fileExists);
            }
            if (!file || !FS.existsSync(file)) {
                event.addError('The tsconfig file %s does not exist.', file || '');
                return;
            }
        }
        else if (TSConfigReader_1.PROJECT_KEY in event.data) {
            const resolved = Path.resolve(event.data[TSConfigReader_1.PROJECT_KEY]);
            if (FS.existsSync(resolved)) {
                file = resolved;
            }
            else {
                file = ts.findConfigFile(resolved, ts.sys.fileExists);
            }
        }
        else if (this.application.isCLI) {
            file = ts.findConfigFile('.', ts.sys.fileExists);
        }
        if (file) {
            this.load(event, file);
        }
    }
    load(event, fileName) {
        const { config } = ts.readConfigFile(fileName, ts.sys.readFile);
        if (config === undefined) {
            event.addError('No valid tsconfig file found for %s.', fileName);
            return;
        }
        if (!_.isPlainObject(config)) {
            event.addError('The tsconfig file %s does not contain a JSON object.', fileName);
            return;
        }
        const { fileNames, options, raw: { typedocOptions } } = ts.parseJsonConfigFileContent(config, ts.sys, Path.resolve(Path.dirname(fileName)), {}, Path.resolve(fileName));
        event.inputFiles = fileNames;
        const ignored = typescript_1.TypeScriptSource.IGNORED;
        for (const key of ignored) {
            delete options[key];
        }
        _.defaults(event.data, typedocOptions, options);
    }
};
TSConfigReader.OPTIONS_KEY = 'tsconfig';
TSConfigReader.PROJECT_KEY = 'project';
__decorate([
    component_1.Option({
        name: TSConfigReader_1.OPTIONS_KEY,
        help: 'Specify a typescript config file that should be loaded. If not specified TypeDoc will look for \'tsconfig.json\' in the current directory.',
        type: declaration_1.ParameterType.String,
        hint: declaration_1.ParameterHint.File
    })
], TSConfigReader.prototype, "options", void 0);
TSConfigReader = TSConfigReader_1 = __decorate([
    component_1.Component({ name: 'options:tsconfig' })
], TSConfigReader);
exports.TSConfigReader = TSConfigReader;
//# sourceMappingURL=tsconfig.js.map