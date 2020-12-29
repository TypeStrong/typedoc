import * as ts from "typescript";

/**
 * Return the default value of the given node.
 *
 * @param node  The TypeScript node whose default value should be extracted.
 * @returns The default value as a string.
 */
export function convertDefaultValue(
    node: ts.Declaration | undefined
): string | undefined {
    const anyNode = node as any;
    if (anyNode?.initializer) {
        return convertExpression(anyNode.initializer);
    } else {
        return undefined;
    }
}

export function convertExpression(
    expression: ts.Expression
): string | undefined {
    switch (expression.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.NullKeyword:
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.PrefixUnaryExpression:
            return expression.getText();
        default:
            // More complex expressions are generally not useful in the documentation.
            // Show that there was a value, but not specifics.
            return "...";
    }
}
