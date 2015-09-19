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
var typescript = require("typescript");
var application_1 = require("./application");
var component_1 = require("./utils/component");
var declaration_1 = require("./utils/options/declaration");
var help_1 = require("./utils/options/help");
(function (ExitCode) {
    ExitCode[ExitCode["OptionError"] = 1] = "OptionError";
    ExitCode[ExitCode["NoInputFiles"] = 2] = "NoInputFiles";
    ExitCode[ExitCode["NoOutput"] = 3] = "NoOutput";
    ExitCode[ExitCode["CompileError"] = 4] = "CompileError";
    ExitCode[ExitCode["OutputError"] = 5] = "OutputError";
})(exports.ExitCode || (exports.ExitCode = {}));
var ExitCode = exports.ExitCode;
var CliApplication = (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        _super.apply(this, arguments);
    }
    CliApplication.prototype.bootstrap = function (options) {
        var result = _super.prototype.bootstrap.call(this, options);
        if (result.hasErrors) {
            process.exit(ExitCode.OptionError);
            return;
        }
        if (this.version) {
            typescript.sys.write(this.toString());
        }
        else if (this.help) {
            typescript.sys.write(help_1.getOptionsHelp(this.options));
        }
        else if (result.inputFiles.length === 0) {
            typescript.sys.write(help_1.getOptionsHelp(this.options));
            process.exit(ExitCode.NoInputFiles);
        }
        else if (!this.out && !this.json) {
            this.logger.error("You must either specify the 'out' or 'json' option.");
            process.exit(ExitCode.NoOutput);
        }
        else {
            var src = this.expandInputFiles(result.inputFiles);
            var project = this.convert(src);
            if (project) {
                if (this.out)
                    this.generateDocs(project, this.out);
                if (this.json)
                    this.generateJson(project, this.json);
                if (this.logger.hasErrors()) {
                    process.exit(ExitCode.OutputError);
                }
            }
            else {
                process.exit(ExitCode.CompileError);
            }
        }
        return result;
    };
    Object.defineProperty(CliApplication.prototype, "isCLI", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        component_1.Option({
            name: 'out',
            help: 'Specifies the location the documentation should be written to.',
            hint: declaration_1.ParameterHint.Directory
        }), 
        __metadata('design:type', String)
    ], CliApplication.prototype, "out");
    __decorate([
        component_1.Option({
            name: 'json',
            help: 'Specifies the location and file name a json file describing the project is written to.',
            hint: declaration_1.ParameterHint.File
        }), 
        __metadata('design:type', String)
    ], CliApplication.prototype, "json");
    __decorate([
        component_1.Option({
            name: 'version',
            short: 'v',
            help: 'Print the TypeDoc\'s version.',
            type: declaration_1.ParameterType.Boolean
        }), 
        __metadata('design:type', Boolean)
    ], CliApplication.prototype, "version");
    __decorate([
        component_1.Option({
            name: 'help',
            short: 'h',
            help: 'Print this message.',
            type: declaration_1.ParameterType.Boolean
        }), 
        __metadata('design:type', Boolean)
    ], CliApplication.prototype, "help");
    return CliApplication;
})(application_1.Application);
exports.CliApplication = CliApplication;
