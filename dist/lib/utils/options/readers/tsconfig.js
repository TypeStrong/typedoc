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
var Path = require("path");
var FS = require("fs");
var _ = require("lodash");
var ts = require("typescript");
var component_1 = require("../../component");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var typescript_1 = require("../sources/typescript");
var TSConfigReader = (function (_super) {
    __extends(TSConfigReader, _super);
    function TSConfigReader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TSConfigReader_1 = TSConfigReader;
    TSConfigReader.prototype.initialize = function () {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -100);
    };
    TSConfigReader.prototype.onDiscover = function (event) {
        if (TSConfigReader_1.OPTIONS_KEY in event.data) {
            this.load(event, Path.resolve(event.data[TSConfigReader_1.OPTIONS_KEY]));
        }
        else if (TSConfigReader_1.PROJECT_KEY in event.data) {
            var file = ts.findConfigFile(event.data[TSConfigReader_1.PROJECT_KEY], ts.sys.fileExists);
            if (file) {
                this.load(event, file);
            }
        }
        else if (this.application.isCLI) {
            var file = ts.findConfigFile('.', ts.sys.fileExists);
            if (file) {
                this.load(event, file);
            }
        }
    };
    TSConfigReader.prototype.load = function (event, fileName) {
        if (!FS.existsSync(fileName)) {
            event.addError('The tsconfig file %s does not exist.', fileName);
            return;
        }
        var config = ts.readConfigFile(fileName, ts.sys.readFile).config;
        if (config === undefined) {
            event.addError('The tsconfig file %s does not contain valid JSON.', fileName);
            return;
        }
        if (!_.isPlainObject(config)) {
            event.addError('The tsconfig file %s does not contain a JSON object.', fileName);
            return;
        }
        var _a = ts.parseJsonConfigFileContent(config, ts.sys, Path.resolve(Path.dirname(fileName)), {}, Path.resolve(fileName)), fileNames = _a.fileNames, options = _a.options, typedocOptions = _a.raw.typedocOptions;
        event.inputFiles = fileNames;
        var ignored = typescript_1.TypeScriptSource.IGNORED;
        for (var _i = 0, ignored_1 = ignored; _i < ignored_1.length; _i++) {
            var key = ignored_1[_i];
            delete options[key];
        }
        _.defaults(event.data, typedocOptions, options);
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
    return TSConfigReader;
    var TSConfigReader_1;
}(options_1.OptionsComponent));
exports.TSConfigReader = TSConfigReader;
//# sourceMappingURL=tsconfig.js.map