var ts = require("typescript");
var nodes = require('./nodes/index');
var converters;
function loadConverters() {
    converters = {};
    for (var nodeName in nodes) {
        var converterClass = nodes[nodeName];
        var converter = new converterClass();
        for (var _i = 0, _a = converter.supports; _i < _a.length; _i++) {
            var supports = _a[_i];
            converters[supports] = converter;
        }
    }
}
function convertNode(context, node) {
    if (context.visitStack.indexOf(node) != -1) {
        return null;
    }
    var oldVisitStack = context.visitStack;
    context.visitStack = oldVisitStack.slice();
    context.visitStack.push(node);
    if (context.getOptions().verbose) {
        var file = ts.getSourceFileOfNode(node);
        var pos = ts.getLineAndCharacterOfPosition(file, node.pos);
        if (node.symbol) {
            context.getLogger().verbose('Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)', context.checker.getFullyQualifiedName(node.symbol), file.fileName, pos.line.toString(), pos.character.toString());
        }
        else {
            context.getLogger().verbose('Visiting node of kind %s in %s (%s:%s)', node.kind.toString(), file.fileName, pos.line.toString(), pos.character.toString());
        }
    }
    var result;
    if (node.kind in converters) {
        result = converters[node.kind].convert(context, node);
    }
    context.visitStack = oldVisitStack;
    return result;
}
exports.convertNode = convertNode;
loadConverters();
