import * as ts from "typescript";
import { flatMap } from "../../utils/array";

export function isNamedNode(node: ts.Node): node is ts.Node & {
    name: ts.Identifier | ts.PrivateIdentifier | ts.ComputedPropertyName;
} {
    const name: ts.Node | undefined = (node as any).name;
    return (
        !!name &&
        (ts.isIdentifierOrPrivateIdentifier(name) ||
            ts.isComputedPropertyName(name))
    );
}

export function getHeritageTypes(
    declarations: readonly (ts.ClassDeclaration | ts.InterfaceDeclaration)[],
    kind: ts.SyntaxKind.ImplementsKeyword | ts.SyntaxKind.ExtendsKeyword
): ts.ExpressionWithTypeArguments[] {
    const exprs = flatMap(declarations, (d) =>
        flatMap(
            d.heritageClauses?.filter((hc) => hc.token === kind) ?? [],
            (hc) => hc.types as readonly ts.ExpressionWithTypeArguments[]
        )
    );

    const seenTexts = new Set<string>();

    return exprs.filter((expr) => {
        const text = expr.getText();
        if (seenTexts.has(text)) {
            return false;
        }
        seenTexts.add(text);
        return true;
    });
}
