"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TypeScriptSource_1;
const ts = require("typescript");
const _ts = require("../../../ts-internal");
const component_1 = require("../../component");
const options_1 = require("../options");
const declaration_1 = require("../declaration");
let TypeScriptSource = TypeScriptSource_1 = class TypeScriptSource extends options_1.OptionsComponent {
    initialize() {
        this.declarations = [];
        for (let declaration of _ts.optionDeclarations) {
            if (!TypeScriptSource_1.IGNORED.includes(declaration.name)) {
                this.addTSOption(declaration);
            }
        }
    }
    getOptionDeclarations() {
        return this.declarations;
    }
    addTSOption(option) {
        const param = {
            name: option.name,
            short: option.shortName,
            help: option.description ? option.description.key : '',
            scope: declaration_1.ParameterScope.TypeScript,
            component: this.componentName
        };
        switch (option.type) {
            case 'number':
                param.type = declaration_1.ParameterType.Number;
                break;
            case 'boolean':
                param.type = declaration_1.ParameterType.Boolean;
                break;
            case 'string':
                param.type = declaration_1.ParameterType.String;
                break;
            case 'list':
                param.type = declaration_1.ParameterType.Array;
                break;
            default:
                param.type = declaration_1.ParameterType.Map;
                param.map = option.type;
                if (option['error']) {
                    const error = _ts.createCompilerDiagnostic(option['error']);
                    param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                }
        }
        this.declarations.push(param);
    }
};
TypeScriptSource.IGNORED = [
    'out', 'version', 'help',
    'watch', 'declaration', 'declarationDir', 'declarationMap', 'mapRoot',
    'sourceMap', 'inlineSources', 'removeComments'
];
TypeScriptSource = TypeScriptSource_1 = __decorate([
    component_1.Component({ name: 'options:typescript' })
], TypeScriptSource);
exports.TypeScriptSource = TypeScriptSource;
//# sourceMappingURL=typescript.js.map