import * as ts from 'typescript';
import * as _ts from '../../../ts-internal';

import { Component } from '../../component';
import { OptionsComponent } from '../options';
import { DeclarationOption, ParameterScope, ParameterType } from '../declaration';

/**
 * Discovers and contributes options declared by TypeScript.
 *
 * typedoc accepts many of the same options as TypeScript itself, so they must be parsed
 * from TypeScript's metadata and declared on typedoc's Option parser.
 */
@Component({name: 'options:typescript'})
export class TypeScriptSource extends OptionsComponent {
    private declarations!: DeclarationOption[];

    /**
     * A list of all TypeScript parameters that should be ignored.
     */
    static IGNORED: string[] = [
        'out', 'version', 'help',
        'watch', 'declaration', 'declarationDir', 'declarationMap', 'mapRoot',
        'sourceMap', 'inlineSources', 'removeComments'
    ];

    initialize() {
        this.declarations = [];

        for (let declaration of _ts.optionDeclarations) {
            if (!TypeScriptSource.IGNORED.includes(declaration.name)) {
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
            help:      option.description ? option.description.key : '',
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

        this.declarations.push(param);
    }
}
