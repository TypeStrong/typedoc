import * as ts from "typescript";

import {Options} from "./options";
import {ParameterScope, ParameterHint} from "./declaration";


export interface IParameterHelp {
    names:string[];
    helps:string[];
    margin:number;
}


/**
 * Prepare parameter information for the [[toString]] method.
 *
 * @param scope  The scope of the parameters whose help should be returned.
 * @returns The columns and lines for the help of the requested parameters.
 */
function getParameterHelp(options:Options, scope:ParameterScope):IParameterHelp {
    var parameters = options.getDeclarationsByScope(scope);
    parameters.sort((a, b) => {
        return <number>ts.compareValues<string>(a.name.toLowerCase(), b.name.toLowerCase())
    });

    var names:string[] = [];
    var helps:string[] = [];
    var margin = 0;

    for (var i = 0; i < parameters.length; i++) {
        var parameter = parameters[i];
        if (!parameter.help) continue;

        var name = " ";
        if (parameter.short) {
            name += "-" + parameter.short;
            if (typeof parameter.hint != 'undefined') {
                name += ' ' + ParameterHint[parameter.hint].toUpperCase();
            }
            name += ", ";
        }

        name += "--" + parameter.name;
        if (parameter.hint) name += ' ' + ParameterHint[parameter.hint].toUpperCase();

        names.push(name);
        helps.push(parameter.help);
        margin = Math.max(name.length, margin);
    }

    return {names:names, helps:helps, margin:margin};
}


/**
 * Print some usage information.
 *
 * Taken from TypeScript (src/compiler/tsc.ts)
 */
export function getOptionsHelp(options:Options):string {
    var typeDoc = getParameterHelp(options, ParameterScope.TypeDoc);
    var typeScript = getParameterHelp(options, ParameterScope.TypeScript);
    var margin = Math.max(typeDoc.margin, typeScript.margin);

    var output:string[] = [];
    output.push('Usage:');
    output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');

    output.push('', 'TypeDoc options:');
    pushHelp(typeDoc);

    output.push('', 'TypeScript options:');
    pushHelp(typeScript);

    output.push('');
    return output.join(ts.sys.newLine);

    function pushHelp(columns:IParameterHelp) {
        for (var i = 0; i < columns.names.length; i++) {
            var usage = columns.names[i];
            var description = columns.helps[i];
            output.push(usage + padding(margin - usage.length + 2) + description);
        }
    }

    function padding(length: number): string {
        return Array(length + 1).join(" ");
    }
}
