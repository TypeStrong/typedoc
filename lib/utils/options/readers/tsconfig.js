var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Path = require("path");
var FS = require("fs");
var _ = require("lodash");
var component_1 = require("../../component");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var TSConfigReader = (function (_super) {
    __extends(TSConfigReader, _super);
    function TSConfigReader() {
        _super.apply(this, arguments);
    }
    TSConfigReader.prototype.initialize = function () {
        this.listenTo(this.owner, options_1.DiscoverEvent.DISCOVER, this.onDiscover, -100);
    };
    TSConfigReader.prototype.onDiscover = function (event) {
        if (TSConfigReader.OPTIONS_KEY in event.data) {
            this.load(event, event.data[TSConfigReader.OPTIONS_KEY]);
        }
        else if (this.application.isCLI) {
            var file = Path.resolve('tsconfig.json');
            if (FS.existsSync(file)) {
                this.load(event, file);
            }
        }
    };
    TSConfigReader.prototype.load = function (event, fileName) {
        if (!FS.existsSync(fileName)) {
            event.addError('The tsconfig file %s does not exist.', fileName);
            return;
        }
        var data = require(fileName);
        if ("files" in data && _.isArray(data.files)) {
            event.inputFiles = data.files;
        }
        if ("compilerOptions" in data) {
            _.merge(event.data, data.compilerOptions);
        }
        if ("typedocOptions" in data) {
            _.merge(event.data, data.typedocOptions);
        }
    };
    TSConfigReader.OPTIONS_KEY = 'tsconfig';
    __decorate([
        component_1.Option({
            name: TSConfigReader.OPTIONS_KEY,
            help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
            type: declaration_1.ParameterType.String,
            hint: declaration_1.ParameterHint.File
        }), 
        __metadata('design:type', String)
    ], TSConfigReader.prototype, "options");
    TSConfigReader = __decorate([
        component_1.Component({ name: "options:tsconfig" }), 
        __metadata('design:paramtypes', [])
    ], TSConfigReader);
    return TSConfigReader;
})(options_1.OptionsComponent);
exports.TSConfigReader = TSConfigReader;
