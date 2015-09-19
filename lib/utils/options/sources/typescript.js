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
var ts = require("typescript");
var component_1 = require("../../component");
var options_1 = require("../options");
var declaration_1 = require("../declaration");
var ignored = [
    'out', 'outDir', 'version', 'help',
    'watch', 'declaration', 'mapRoot',
    'sourceMap', 'removeComments'
];
var TypeScriptSource = (function (_super) {
    __extends(TypeScriptSource, _super);
    function TypeScriptSource() {
        _super.apply(this, arguments);
    }
    TypeScriptSource.prototype.initialize = function () {
        this.declarations = [];
        for (var _i = 0, _a = ts.optionDeclarations; _i < _a.length; _i++) {
            var declaration = _a[_i];
            this.addTSOption(declaration);
        }
    };
    TypeScriptSource.prototype.getOptionDeclarations = function () {
        return this.declarations;
    };
    TypeScriptSource.prototype.addTSOption = function (option) {
        if (ignored.indexOf(option.name) != -1)
            return;
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
                if (option.error) {
                    var error = ts.createCompilerDiagnostic(option.error);
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
    TypeScriptSource = __decorate([
        component_1.Component({ name: "options:typescript" }), 
        __metadata('design:paramtypes', [])
    ], TypeScriptSource);
    return TypeScriptSource;
})(options_1.OptionsComponent);
exports.TypeScriptSource = TypeScriptSource;
