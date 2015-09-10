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
            break;
        case 8:
            return expression.text;
            break;
        case 97:
            return 'true';
            break;
        case 82:
            return 'false';
            break;
        default:
            var source = ts.getSourceFileOfNode(expression);
            return source.text.substring(expression.pos, expression.end);
            break;
    }
}
exports.convertExpression = convertExpression;
