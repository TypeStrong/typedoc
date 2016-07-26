import * as ts from "typescript";

import {Component} from "../../component";
import {OptionsComponent} from "../options";
import {IOptionDeclaration, ParameterScope, ParameterType, ParameterHint} from "../declaration";


@Component({name:"options:typescript"})
export class TypeScriptSource extends OptionsComponent
{
    private declarations:IOptionDeclaration[];

    /**
     * A list of all TypeScript parameters that should be ignored.
     */
    static IGNORED:string[] = [
        'out', 'version', 'help',
        'watch', 'declaration', 'mapRoot',
        'sourceMap', 'inlineSources', 'removeComments'
    ];


    initialize() {
        var ignored = TypeScriptSource.IGNORED;
        this.declarations = [];

        for (var declaration of ts.optionDeclarations) {
            if (ignored.indexOf(declaration.name) === -1) {
                this.addTSOption(declaration);
            }
        }
    }


    /**
     * Return all option declarations emitted by this component.
     */
    getOptionDeclarations():IOptionDeclaration[] {
        return this.declarations;
    }


    private addTSOption(option:ts.CommandLineOption) {
        var param:IOptionDeclaration = {
            name:      option.name,
            short:     option.shortName,
            help:      option.description ? option.description.key : null,
            scope:     ParameterScope.TypeScript,
            component: this.componentName
        };

        switch (option.type) {
            case "number":
                param.type = ParameterType.Number;
                break;
            case "boolean":
                param.type = ParameterType.Boolean;
                break;
            case "string":
                param.type = ParameterType.String;
                break;
            default:
                param.type = ParameterType.Map;
                param.map = option.type;
                if (option['error']) {
                    var error = ts.createCompilerDiagnostic(option['error']);
                    param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                }
        }

        switch (option.paramType) {
            case ts.Diagnostics.FILE:
                param.hint = ParameterHint.File;
                break;
            case ts.Diagnostics.DIRECTORY:
                param.hint = ParameterHint.Directory;
                break;
        }

        this.declarations.push(param);
    }
}
