import * as ts from "typescript";

/**
 * Return the default value of the given node.
 *
 * @param node  The TypeScript node whose default value should be extracted.
 * @returns The default value as a string.
 */

export function convertDefaultValue(
    node: ts.VariableDeclaration | ts.ParameterDeclaration | ts.EnumMember
): string | undefined {
    if (node.initializer) {
        return convertExpression(node.initializer);
    } else {
        return undefined;
    }
}

export function convertExpression(expression: ts.Expression): string {
    switch (expression.kind) {
        case ts.SyntaxKind.StringLiteral:
            return '"' + (<ts.LiteralExpression>expression).text + '"';
        case ts.SyntaxKind.NumericLiteral:
            return (<ts.LiteralExpression>expression).text;
        case ts.SyntaxKind.TrueKeyword:
            return "true";
        case ts.SyntaxKind.FalseKeyword:
            return "false";
        case ts.SyntaxKind.NullKeyword:
            return "null";
        default:
            return expression.getText(expression.getSourceFile());
    }
}
