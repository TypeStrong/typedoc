"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ts = require("typescript");
var component_1 = require("../../component");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var TypeScriptSource = (function (_super) {
    __extends(TypeScriptSource, _super);
    function TypeScriptSource() {
        _super.apply(this, arguments);
    }
    TypeScriptSource.prototype.initialize = function () {
        var ignored = TypeScriptSource.IGNORED;
        this.declarations = [];
        for (var _i = 0, _a = ts.optionDeclarations; _i < _a.length; _i++) {
            var declaration = _a[_i];
            if (ignored.indexOf(declaration.name) === -1) {
                this.addTSOption(declaration);
            }
        }
    };
    TypeScriptSource.prototype.getOptionDeclarations = function () {
        return this.declarations;
    };
    TypeScriptSource.prototype.addTSOption = function (option) {
        var param = {
            name: option.name,
            short: option.shortName,
            help: option.description ? option.description.key : null,
            scope: declaration_1.ParameterScope.TypeScript,
            component: this.componentName
        };
        switch (option.type) {
            case "number":
                param.type = declaration_1.ParameterType.Number;
                break;
            case "boolean":
                param.type = declaration_1.ParameterType.Boolean;
                break;
            case "string":
                param.type = declaration_1.ParameterType.String;
                break;
            default:
                param.type = declaration_1.ParameterType.Map;
                param.map = option.type;
                if (option['error']) {
                    var error = ts.createCompilerDiagnostic(option['error']);
                    param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                }
        }
        switch (option.paramType) {
            case ts.Diagnostics.FILE:
                param.hint = declaration_1.ParameterHint.File;
                break;
            case ts.Diagnostics.DIRECTORY:
                param.hint = declaration_1.ParameterHint.Directory;
                break;
        }
        this.declarations.push(param);
    };
    TypeScriptSource.IGNORED = [
        'out', 'version', 'help',
        'watch', 'declaration', 'mapRoot',
        'sourceMap', 'removeComments'
    ];
    TypeScriptSource = __decorate([
        component_1.Component({ name: "options:typescript" })
    ], TypeScriptSource);
    return TypeScriptSource;
}(options_1.OptionsComponent));
exports.TypeScriptSource = TypeScriptSource;
