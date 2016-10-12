"use strict";
var ts = require("typescript");
function convertDefaultValue(node) {
    if (node.initializer) {
        return convertExpression(node.initializer);
    }
    else {
        return null;
    }
}
exports.convertDefaultValue = convertDefaultValue;
function convertExpression(expression) {
    switch (expression.kind) {
        case 9:
            return '"' + expression.text + '"';
        case 8:
            return expression.text;
        case 99:
            return 'true';
        case 84:
            return 'false';
        default:
            var source = ts.getSourceFileOfNode(expression);
            return source.text.substring(expression.pos, expression.end);
    }
}
exports.convertExpression = convertExpression;
//# sourceMappingURL=convert-expression.js.map