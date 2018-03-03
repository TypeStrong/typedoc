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
var typescript = require("typescript");
var application_1 = require("./application");
var component_1 = require("./utils/component");
var declaration_1 = require("./utils/options/declaration");
var help_1 = require("./utils/options/help");
var ExitCode;
(function (ExitCode) {
    ExitCode[ExitCode["OptionError"] = 1] = "OptionError";
    ExitCode[ExitCode["NoInputFiles"] = 2] = "NoInputFiles";
    ExitCode[ExitCode["NoOutput"] = 3] = "NoOutput";
    ExitCode[ExitCode["CompileError"] = 4] = "CompileError";
    ExitCode[ExitCode["OutputError"] = 5] = "OutputError";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
var CliApplication = (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CliApplication.prototype.bootstrap = function (options) {
        var result = _super.prototype.bootstrap.call(this, options);
        if (result.hasErrors) {
            process.exit(1);
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
            process.exit(2);
        }
        else if (!this.out && !this.json) {
            this.logger.error("You must either specify the 'out' or 'json' option.");
            process.exit(3);
        }
        else {
            var src = this.expandInputFiles(result.inputFiles);
            var project = this.convert(src);
            if (project) {
                if (this.out) {
                    this.generateDocs(project, this.out);
                }
                if (this.json) {
                    this.generateJson(project, this.json);
                }
                if (this.logger.hasErrors()) {
                    process.exit(5);
                }
            }
            else {
                process.exit(4);
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
        })
    ], CliApplication.prototype, "out", void 0);
    __decorate([
        component_1.Option({
            name: 'json',
            help: 'Specifies the location and file name a json file describing the project is written to.',
            hint: declaration_1.ParameterHint.File
        })
    ], CliApplication.prototype, "json", void 0);
    __decorate([
        component_1.Option({
            name: 'version',
            short: 'v',
            help: 'Print the TypeDoc\'s version.',
            type: declaration_1.ParameterType.Boolean
        })
    ], CliApplication.prototype, "version", void 0);
    __decorate([
        component_1.Option({
            name: 'help',
            short: 'h',
            help: 'Print this message.',
            type: declaration_1.ParameterType.Boolean
        })
    ], CliApplication.prototype, "help", void 0);
    return CliApplication;
}(application_1.Application));
exports.CliApplication = CliApplication;
//# sourceMappingURL=cli.js.map