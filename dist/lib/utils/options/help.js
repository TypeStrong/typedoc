"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ts = require("../../ts-internal");
var declaration_1 = require("./declaration");
function getParameterHelp(options, scope) {
    var parameters = options.getDeclarationsByScope(scope);
    parameters.sort(function (a, b) {
        return _ts.compareValues(a.name.toLowerCase(), b.name.toLowerCase());
    });
    var names = [];
    var helps = [];
    var margin = 0;
    for (var i = 0; i < parameters.length; i++) {
        var parameter = parameters[i];
        if (!parameter.help) {
            continue;
        }
        var name_1 = ' ';
        if (parameter.short) {
            name_1 += '-' + parameter.short;
            if (typeof parameter.hint !== 'undefined') {
                name_1 += ' ' + declaration_1.ParameterHint[parameter.hint].toUpperCase();
            }
            name_1 += ', ';
        }
        name_1 += '--' + parameter.name;
        if (parameter.hint) {
            name_1 += ' ' + declaration_1.ParameterHint[parameter.hint].toUpperCase();
        }
        names.push(name_1);
        helps.push(parameter.help);
        margin = Math.max(name_1.length, margin);
    }
    return { names: names, helps: helps, margin: margin };
}
function getOptionsHelp(options) {
    var typeDoc = getParameterHelp(options, declaration_1.ParameterScope.TypeDoc);
    var output = [];
    output.push('Usage:');
    output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
    output.push('', 'TypeDoc options:');
    pushHelp(typeDoc);
    output.push('', 'TypeScript options:');
    output.push('See https://www.typescriptlang.org/docs/handbook/compiler-options.html');
    output.push('');
    return output.join(ts.sys.newLine);
    function pushHelp(columns) {
        for (var i = 0; i < columns.names.length; i++) {
            var usage = columns.names[i];
            var description = columns.helps[i];
            output.push(usage + padding(typeDoc.margin - usage.length + 2) + description);
        }
    }
    function padding(length) {
        return Array(length + 1).join(' ');
    }
}
exports.getOptionsHelp = getOptionsHelp;
//# sourceMappingURL=help.js.map