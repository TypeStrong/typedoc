import * as ts from "typescript";

export function isNamedNode(
    node: ts.Node
): node is ts.Node & {
    name: ts.Identifier | ts.PrivateIdentifier | ts.ComputedPropertyName;
} {
    const name: ts.Node | undefined = (node as any).name;
    return (
        !!name &&
        (ts.isIdentifierOrPrivateIdentifier(name) ||
            ts.isComputedPropertyName(name))
    );
}
