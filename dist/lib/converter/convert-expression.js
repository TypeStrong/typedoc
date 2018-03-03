"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ts = require("../ts-internal");
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
        case ts.SyntaxKind.StringLiteral:
            return '"' + expression.text + '"';
        case ts.SyntaxKind.NumericLiteral:
            return expression.text;
        case ts.SyntaxKind.TrueKeyword:
            return 'true';
        case ts.SyntaxKind.FalseKeyword:
            return 'false';
        default:
            var source = _ts.getSourceFileOfNode(expression);
            return source.text.substring(expression.pos, expression.end);
    }
}
exports.convertExpression = convertExpression;
//# sourceMappingURL=convert-expression.js.map