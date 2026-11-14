import * as ts from "../ts.js";

const declarationCache = new WeakMap<ts.Symbol, readonly ts.Declaration[]>();

/**
 * Get the declarations of a symbol. The TypeScript API returns them as handles,
 * which are resolved in the project that produced the symbol.
 */
export function getDeclarations(symbol: ts.Symbol): readonly ts.Declaration[] {
    let declarations = declarationCache.get(symbol);
    if (!declarations) {
        declarations = symbol.declarations
            .map((handle) => handle.resolve())
            .filter((decl) => decl !== undefined)
            .map((decl) => getAssignmentDeclaration(symbol, decl));
        declarationCache.set(symbol, declarations);
    }
    return declarations;
}

export function getValueDeclaration(symbol: ts.Symbol): ts.Declaration | undefined {
    const declaration = symbol.valueDeclaration?.resolve();
    return declaration && getAssignmentDeclaration(symbol, declaration);
}

/**
 * Members created by an assignment, such as `exports.x = 1` or `fn.x = 1`, are
 * declared by the whole assignment in TypeScript 7, and by its left side in
 * TypeScript 6 and earlier. TypeDoc expects the left side.
 * `module.exports = x` is declared by the assignment in both.
 */
function getAssignmentDeclaration(symbol: ts.Symbol, declaration: ts.Declaration): ts.Declaration {
    if (
        ts.isBinaryExpression(declaration) &&
        (ts.isPropertyAccessExpression(declaration.left) || ts.isElementAccessExpression(declaration.left)) &&
        symbol.escapedName !== ts.InternalSymbolName.ExportEquals
    ) {
        return declaration.left as ts.Node as ts.Declaration;
    }
    return declaration;
}

export function getSignatureDeclaration(signature: ts.Signature): ts.SignatureDeclaration | undefined {
    return signature.declaration?.resolve() as ts.SignatureDeclaration | undefined;
}

/**
 * Module symbols are declared by source files, which TypeScript 7 does not type as declarations.
 */
export function isSourceFileDeclaration(node: ts.Node): node is ts.Declaration & ts.SourceFile {
    return ts.isSourceFile(node);
}

/**
 * Whether the node is a `declare global` block, which TypeScript 7 parses as a module named `global`.
 */
export function isGlobalAugmentation(node: ts.Node): node is ts.ModuleDeclaration {
    return ts.isModuleDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === "global" &&
        node.keyword !== ts.SyntaxKind.NamespaceKeyword;
}

const reparsedTagKinds = new Set([
    ts.SyntaxKind.JSDocTypedefTag,
    ts.SyntaxKind.JSDocCallbackTag,
    ts.SyntaxKind.JSDocPropertyTag,
    ts.SyntaxKind.JSDocParameterTag,
    ts.SyntaxKind.JSDocTemplateTag,
    ts.SyntaxKind.JSDocReturnTag,
]);

/**
 * In JavaScript files, TypeScript 7 creates declarations for JSDoc tags such as
 * `@typedef`, `@callback`, `@property`, `@param` and `@template`. These reparsed
 * declarations keep the range of the tag that they were created from, which is
 * how this finds the tag.
 */
export function getReparsedJSDocTag(node: ts.Node): ts.JSDocTag | undefined {
    if (!(node.flags & ts.NodeFlags.Reparsed)) {
        return;
    }

    for (let host: ts.Node | undefined = node; host; host = host.parent) {
        // The comment may also belong to a sibling, such as the implementation of an @overload.
        const candidates = [host];
        host.parent?.forEachChild((child) => {
            if (child !== host && child.pos <= node.pos && node.end <= child.end) {
                candidates.push(child);
            }
        });
        for (const doc of candidates.flatMap((candidate) => candidate.jsDoc ?? [])) {
            if (doc.pos <= node.pos && node.end <= doc.end) {
                let tag: ts.JSDocTag | undefined;
                const visit = (child: ts.Node): undefined => {
                    if (child.pos > node.pos || child.end < node.end) {
                        return;
                    }
                    if (reparsedTagKinds.has(child.kind)) {
                        tag = child as ts.JSDocTag;
                    }
                    child.forEachChild(visit);
                };
                doc.forEachChild(visit);
                if (tag) {
                    return tag;
                }
            }
        }
    }
}

/**
 * Get the position at which a JSDoc comment starts. TypeScript 7 starts JSDoc nodes
 * at the end of the preceding token, TypeScript 6 started them at the comment.
 */
export function getJSDocStart(doc: ts.Node): number {
    const text = doc.getSourceFile().text;
    const range = ts.getLeadingCommentRanges(text, doc.pos)?.find((range) => range.end === doc.end);
    return range?.pos ?? text.lastIndexOf("/**", doc.end);
}

/**
 * Get the type annotation of a declaration. In JavaScript files, TypeScript 7 reparses JSDoc
 * types such as `@type` into type annotations, which TypeScript 6 left out. TypeDoc treats
 * an annotation as explicit, so it ignores reparsed ones.
 */
export function getTypeAnnotation(node: { readonly type?: ts.TypeNode | undefined }): ts.TypeNode | undefined {
    if (node.type && !(node.type.flags & ts.NodeFlags.Reparsed)) {
        return node.type;
    }
}

/**
 * Get the modifier flags of a node, including those of the variable statement
 * that declares it. TypeDoc also asks for these on expressions, such as
 * `exports.x = ...` in JavaScript, which TypeScript does not type as declarations.
 */
export function getCombinedModifierFlags(node: ts.Node): ts.ModifierFlags {
    return ts.getCombinedModifierFlags(node as ts.Declaration);
}

export function getQualifiedName(symbol: ts.Symbol, defaultName: string) {
    // Two implementation options for this one:
    // 1. Use the symbol's parent, to walk up until we hit a source file symbol (if in a module)
    //    or undefined (if in a global file)
    // 2. Use checker.getFullyQualifiedName and parse out the name from the returned string.
    // The parent method is easier to check for now.
    let sym: ts.Symbol | undefined = symbol;
    const parts: string[] = [];
    while (sym && !getDeclarations(sym).some(ts.isSourceFile)) {
        parts.unshift(getHumanName(sym.name));
        sym = sym.getParent();
    }

    return parts.join(".") || defaultName;
}

export function getHumanName(name: string) {
    // Unique symbols get a name that will change between runs of the compiler.
    const match = /^__@(.*)@\d+$/.exec(name);
    if (match) {
        return `[${match[1]}]`;
    }

    // Private names are prefixed with a counter which changes between runs too.
    const privateMatch = /^__#\d+@(#.*)$/.exec(name);
    if (privateMatch) {
        return privateMatch[1];
    }

    return name;
}

export function findAncestor<T extends ts.Node>(
    node: ts.Node | undefined,
    callback: (element: ts.Node) => element is T,
): T | undefined;
export function findAncestor(
    node: ts.Node | undefined,
    callback: (element: ts.Node) => boolean | "quit",
): ts.Node | undefined;
export function findAncestor(
    node: ts.Node | undefined,
    callback: (element: ts.Node) => boolean | "quit",
): ts.Node | undefined {
    while (node) {
        const result = callback(node);
        if (result === "quit") {
            return undefined;
        }
        if (result) {
            return node;
        }
        node = node.parent;
    }
    return undefined;
}

const functionLikeKinds = new Set([
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.Constructor,
    ts.SyntaxKind.GetAccessor,
    ts.SyntaxKind.SetAccessor,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.ArrowFunction,
    ts.SyntaxKind.MethodSignature,
    ts.SyntaxKind.CallSignature,
    ts.SyntaxKind.JSDocSignature,
    ts.SyntaxKind.ConstructSignature,
    ts.SyntaxKind.IndexSignature,
    ts.SyntaxKind.FunctionType,
    ts.SyntaxKind.ConstructorType,
]);

export function isFunctionLike(node: ts.Node | undefined): node is ts.SignatureDeclaration {
    return !!node && functionLikeKinds.has(node.kind);
}

/**
 * The types that a class or interface declaration extends or implements.
 */
export function getAllSuperTypeNodes(node: ts.Node): readonly ts.HeritageClauseElement[] {
    if (ts.isInterfaceDeclaration(node) || ts.isClassLikeDeclaration(node)) {
        return (node.heritageClauses ?? []).flatMap((clause) => clause.types);
    }
    return [];
}

export function flattenDiagnosticMessageText(diagnostic: ts.Diagnostic, newLine = "\n", indent = 0): string {
    let result = "  ".repeat(indent) + diagnostic.text;
    for (const chain of diagnostic.messageChain ?? []) {
        result += newLine + flattenDiagnosticMessageText(chain, newLine, indent + 1);
    }
    return result;
}
