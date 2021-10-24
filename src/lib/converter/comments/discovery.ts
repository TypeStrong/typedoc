import * as ts from "typescript";
import { ReflectionKind } from "../../models";

const wantedKinds: Record<ReflectionKind, ts.SyntaxKind[]> = {
    [ReflectionKind.Project]: [ts.SyntaxKind.SourceFile],
    [ReflectionKind.Module]: [ts.SyntaxKind.SourceFile],
    [ReflectionKind.Namespace]: [
        ts.SyntaxKind.ModuleDeclaration,
        ts.SyntaxKind.SourceFile,
    ],
    [ReflectionKind.Enum]: [
        ts.SyntaxKind.EnumDeclaration,
        ts.SyntaxKind.VariableDeclaration,
    ],
    [ReflectionKind.EnumMember]: [
        ts.SyntaxKind.EnumMember,
        ts.SyntaxKind.PropertyAssignment,
    ],
    [ReflectionKind.Variable]: [ts.SyntaxKind.VariableDeclaration],
    [ReflectionKind.Function]: [
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.VariableDeclaration,
    ],
    [ReflectionKind.Class]: [ts.SyntaxKind.ClassDeclaration],
    [ReflectionKind.Interface]: [
        ts.SyntaxKind.InterfaceDeclaration,
        ts.SyntaxKind.JSDocTypedefTag,
    ],
    [ReflectionKind.Constructor]: [ts.SyntaxKind.Constructor],
    [ReflectionKind.Property]: [
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertySignature,
        ts.SyntaxKind.JSDocPropertyTag,
        ts.SyntaxKind.BinaryExpression,
    ],
    [ReflectionKind.Method]: [
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertySignature,
    ],
    [ReflectionKind.CallSignature]: [
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertySignature,
        ts.SyntaxKind.CallSignature,
    ],
    [ReflectionKind.IndexSignature]: [ts.SyntaxKind.IndexSignature],
    [ReflectionKind.ConstructorSignature]: [ts.SyntaxKind.ConstructSignature],
    [ReflectionKind.Parameter]: [ts.SyntaxKind.Parameter],
    [ReflectionKind.TypeLiteral]: [ts.SyntaxKind.TypeLiteral],
    [ReflectionKind.TypeParameter]: [ts.SyntaxKind.TypeParameter],
    [ReflectionKind.Accessor]: [
        ts.SyntaxKind.GetAccessor,
        ts.SyntaxKind.SetAccessor,
    ],
    [ReflectionKind.GetSignature]: [ts.SyntaxKind.GetAccessor],
    [ReflectionKind.SetSignature]: [ts.SyntaxKind.SetAccessor],
    [ReflectionKind.ObjectLiteral]: [ts.SyntaxKind.ObjectLiteralExpression],
    [ReflectionKind.TypeAlias]: [
        ts.SyntaxKind.TypeAliasDeclaration,
        ts.SyntaxKind.JSDocTypedefTag,
    ],
    [ReflectionKind.Event]: [], /// this needs to go away
    [ReflectionKind.Reference]: [
        ts.SyntaxKind.NamespaceExport,
        ts.SyntaxKind.ExportSpecifier,
    ],
};

export function discoverComment(
    symbol: ts.Symbol,
    kind: ReflectionKind
): [ts.SourceFile, ts.CommentRange] | undefined {
    for (const decl of symbol.declarations || []) {
        const text = decl.getSourceFile().text;
        if (wantedKinds[kind].includes(decl.kind)) {
            const comments = ts.getLeadingCommentRanges(text, decl.pos);
            const lastDocComment = comments
                ?.reverse()
                .find(
                    (c) =>
                        text[c.pos] === "/" &&
                        text[c.pos + 1] === "*" &&
                        text[c.pos + 2] === "*"
                );

            if (lastDocComment) {
                return [decl.getSourceFile(), lastDocComment];
            }
        }
    }
}
