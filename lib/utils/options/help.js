"use strict";
var ts = require("typescript");
var declaration_1 = require("./declaration");
function getParameterHelp(options, scope) {
    var parameters = options.getDeclarationsByScope(scope);
    parameters.sort(function (a, b) {
        return ts.compareValues(a.name.toLowerCase(), b.name.toLowerCase());
    });
    var names = [];
    var helps = [];
    var margin = 0;
    for (var i = 0; i < parameters.length; i++) {
        var parameter = parameters[i];
        if (!parameter.help)
            continue;
        var name = " ";
        if (parameter.short) {
            name += "-" + parameter.short;
            if (typeof parameter.hint != 'undefined') {
                name += ' ' + declaration_1.ParameterHint[parameter.hint].toUpperCase();
            }
            name += ", ";
        }
        name += "--" + parameter.name;
        if (parameter.hint)
            name += ' ' + declaration_1.ParameterHint[parameter.hint].toUpperCase();
        names.push(name);
        helps.push(parameter.help);
        margin = Math.max(name.length, margin);
    }
    return { names: names, helps: helps, margin: margin };
}
function getOptionsHelp(options) {
    var typeDoc = getParameterHelp(options, declaration_1.ParameterScope.TypeDoc);
    var typeScript = getParameterHelp(options, declaration_1.ParameterScope.TypeScript);
    var margin = Math.max(typeDoc.margin, typeScript.margin);
    var output = [];
    output.push('Usage:');
    output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
    output.push('', 'TypeDoc options:');
    pushHelp(typeDoc);
    output.push('', 'TypeScript options:');
    pushHelp(typeScript);
    output.push('');
    return output.join(ts.sys.newLine);
    function pushHelp(columns) {
        for (var i = 0; i < columns.names.length; i++) {
            var usage = columns.names[i];
            var description = columns.helps[i];
            output.push(usage + padding(margin - usage.length + 2) + description);
        }
    }
    function padding(length) {
        return Array(length + 1).join(" ");
    }
}
exports.getOptionsHelp = getOptionsHelp;
//# sourceMappingURL=help.js.map