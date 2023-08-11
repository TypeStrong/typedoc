import ts from "typescript";

export function isNamedNode(node: unknown): node is {
    readonly name:
        | ts.Identifier
        | ts.PrivateIdentifier
        | ts.ComputedPropertyName;
} {
    const name: ts.Node | undefined = (node as any).name;
    return !!name && (ts.isMemberName(name) || ts.isComputedPropertyName(name));
}

export function getHeritageTypes(
    declarations: readonly (ts.ClassDeclaration | ts.InterfaceDeclaration)[],
    kind: ts.SyntaxKind.ImplementsKeyword | ts.SyntaxKind.ExtendsKeyword,
): ts.ExpressionWithTypeArguments[] {
    const exprs = declarations.flatMap((d) =>
        (d.heritageClauses ?? [])
            .filter((hc) => hc.token === kind)
            .flatMap(
                (hc) => hc.types as readonly ts.ExpressionWithTypeArguments[],
            ),
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

export function isObjectType(type: ts.Type): type is ts.ObjectType {
    return typeof (type as any).objectFlags === "number";
}
