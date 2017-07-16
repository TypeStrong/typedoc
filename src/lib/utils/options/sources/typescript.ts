import * as ts from 'typescript';
import * as _ts from '../../../ts-internal';

import {Component} from '../../component';
import {OptionsComponent} from '../options';
import {DeclarationOption, ParameterScope, ParameterType, ParameterHint} from '../declaration';

@Component({name: 'options:typescript'})
export class TypeScriptSource extends OptionsComponent {
    private declarations: DeclarationOption[];

    /**
     * A list of all TypeScript parameters that should be ignored.
     */
    static IGNORED: string[] = [
        'out', 'version', 'help',
        'watch', 'declaration', 'declarationDir', 'mapRoot',
        'sourceMap', 'inlineSources', 'removeComments'
    ];

    initialize() {
        const ignored = TypeScriptSource.IGNORED;
        this.declarations = [];

        for (let declaration of _ts.optionDeclarations) {
            if (ignored.indexOf(declaration.name) === -1) {
                this.addTSOption(declaration);
            }
        }
    }

    /**
     * Return all option declarations emitted by this component.
     */
    getOptionDeclarations(): DeclarationOption[] {
        return this.declarations;
    }

    private addTSOption(option: _ts.CommandLineOption) {
        const param: DeclarationOption = {
            name:      option.name,
            short:     option.shortName,
            help:      option.description ? option.description.key : null,
            scope:     ParameterScope.TypeScript,
            component: this.componentName
        };

        switch (option.type) {
            case 'number':
                param.type = ParameterType.Number;
                break;
            case 'boolean':
                param.type = ParameterType.Boolean;
                break;
            case 'string':
                param.type = ParameterType.String;
                break;
            case 'list':
                param.type = ParameterType.Array;
                break;
            default:
                param.type = ParameterType.Map;
                param.map = option.type;
                if (option['error']) {
                    const error = _ts.createCompilerDiagnostic(option['error']);
                    param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                }
        }

        switch (option.paramType) {
            case _ts.Diagnostics.FILE:
                param.hint = ParameterHint.File;
                break;
            case _ts.Diagnostics.DIRECTORY:
                param.hint = ParameterHint.Directory;
                break;
        }

        this.declarations.push(param);
    }
}
