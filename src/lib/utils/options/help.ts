import * as ts from 'typescript';
import * as _ts from '../../ts-internal';

import { Options } from './options';
import { ParameterScope, ParameterHint } from './declaration';

export interface ParameterHelp {
    names: string[];
    helps: string[];
    margin: number;
}

/**
 * Prepare parameter information for the [[toString]] method.
 *
 * @param scope  The scope of the parameters whose help should be returned.
 * @returns The columns and lines for the help of the requested parameters.
 */
function getParameterHelp(options: Options, scope: ParameterScope): ParameterHelp {
    const parameters = options.getDeclarationsByScope(scope);
    parameters.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    const names: string[] = [];
    const helps: string[] = [];
    let margin = 0;

    for (let i = 0; i < parameters.length; i++) {
        const parameter = parameters[i];
        if (!parameter.help) {
            continue;
        }

        let name = ' ';
        if (parameter.short) {
            name += '-' + parameter.short;
            if (typeof parameter.hint !== 'undefined') {
                name += ' ' + ParameterHint[parameter.hint].toUpperCase();
            }
            name += ', ';
        }

        name += '--' + parameter.name;
        if (parameter.hint) {
            name += ' ' + ParameterHint[parameter.hint].toUpperCase();
        }

        names.push(name);
        helps.push(parameter.help);
        margin = Math.max(name.length, margin);
    }

    return {names: names, helps: helps, margin: margin};
}

/**
 * Print some usage information.
 *
 * Taken from TypeScript (src/compiler/tsc.ts)
 */
export function getOptionsHelp(options: Options): string {
    const typeDoc = getParameterHelp(options, ParameterScope.TypeDoc);

    const output: string[] = [];
    output.push('Usage:');
    output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');

    output.push('', 'TypeDoc options:');
    pushHelp(typeDoc);

    output.push('', 'TypeScript options:');
    output.push('See https://www.typescriptlang.org/docs/handbook/compiler-options.html');

    output.push('');
    return output.join(ts.sys.newLine);

    function pushHelp(columns: ParameterHelp) {
        for (let i = 0; i < columns.names.length; i++) {
            const usage = columns.names[i];
            const description = columns.helps[i];
            output.push(usage + padding(typeDoc.margin - usage.length + 2) + description);
        }
    }

    function padding(length: number): string {
        return Array(length + 1).join(' ');
    }
}
