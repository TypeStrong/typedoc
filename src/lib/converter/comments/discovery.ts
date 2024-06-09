import ts from "typescript";
import { ReflectionKind } from "../../models";
import { assertNever, type Logger } from "../../utils";
import { CommentStyle } from "../../utils/options/declaration";
import { nicePath } from "../../utils/paths";
import { ok } from "assert";

const variablePropertyKinds = [
    ts.SyntaxKind.PropertyDeclaration,
    ts.SyntaxKind.PropertySignature,
    ts.SyntaxKind.BinaryExpression,
    ts.SyntaxKind.PropertyAssignment,
    ts.SyntaxKind.ShorthandPropertyAssignment,
    // class X { constructor(/** Comment */ readonly z: string) }
    ts.SyntaxKind.Parameter,
    // Variable values
    ts.SyntaxKind.VariableDeclaration,
    ts.SyntaxKind.BindingElement,
    ts.SyntaxKind.ExportAssignment,
    ts.SyntaxKind.PropertyAccessExpression,
];

// Note: This does NOT include JSDoc syntax kinds. This is important!
// Comments from @typedef and @callback tags are handled specially by
// the JSDoc converter because we only want part of the comment when
// getting them.
const wantedKinds: Record<ReflectionKind, ts.SyntaxKind[]> = {
    [ReflectionKind.Project]: [
        ts.SyntaxKind.SourceFile,
        ts.SyntaxKind.ModuleDeclaration,
    ],
    [ReflectionKind.Module]: [
        ts.SyntaxKind.SourceFile,
        ts.SyntaxKind.ModuleDeclaration,
    ],
    [ReflectionKind.Namespace]: [
        ts.SyntaxKind.ModuleDeclaration,
        ts.SyntaxKind.SourceFile,
        ts.SyntaxKind.BindingElement,
        ts.SyntaxKind.ExportSpecifier,
        ts.SyntaxKind.NamespaceExport,
        // @namespace support
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.BindingElement,
        ts.SyntaxKind.ExportAssignment,
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertyAssignment,
        ts.SyntaxKind.ShorthandPropertyAssignment,
    ],
    [ReflectionKind.Enum]: [
        ts.SyntaxKind.EnumDeclaration,
        ts.SyntaxKind.VariableDeclaration,
    ],
    [ReflectionKind.EnumMember]: [
        ts.SyntaxKind.EnumMember,
        // These here so that @enum gets comments
        ts.SyntaxKind.PropertyAssignment,
        ts.SyntaxKind.PropertySignature,
    ],
    [ReflectionKind.Variable]: variablePropertyKinds,
    [ReflectionKind.Function]: [
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.BindingElement,
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.ExportAssignment,
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.PropertyAssignment,
        ts.SyntaxKind.ShorthandPropertyAssignment,
    ],
    [ReflectionKind.Class]: [
        ts.SyntaxKind.ClassDeclaration,
        ts.SyntaxKind.BindingElement,
        // If marked with @class
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.ExportAssignment,
        ts.SyntaxKind.FunctionDeclaration,
    ],
    [ReflectionKind.Interface]: [
        ts.SyntaxKind.InterfaceDeclaration,
        ts.SyntaxKind.TypeAliasDeclaration,
    ],
    [ReflectionKind.Constructor]: [ts.SyntaxKind.Constructor],
    [ReflectionKind.Property]: variablePropertyKinds,
    [ReflectionKind.Method]: [
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.MethodDeclaration,
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
    [ReflectionKind.Accessor]: [ts.SyntaxKind.PropertyDeclaration],
    [ReflectionKind.GetSignature]: [ts.SyntaxKind.GetAccessor],
    [ReflectionKind.SetSignature]: [ts.SyntaxKind.SetAccessor],
    [ReflectionKind.TypeAlias]: [ts.SyntaxKind.TypeAliasDeclaration],
    [ReflectionKind.Reference]: [
        ts.SyntaxKind.NamespaceExport,
        ts.SyntaxKind.ExportSpecifier,
    ],
    // Non-TS kind, will never have comments.
    [ReflectionKind.Document]: [],
};

export interface DiscoveredComment {
    file: ts.SourceFile;
    ranges: ts.CommentRange[];
    jsDoc: ts.JSDoc | undefined;
}

export function discoverFileComments(
    node: ts.SourceFile,
    commentStyle: CommentStyle,
) {
    const text = node.text;

    const comments = collectCommentRanges(
        ts.getLeadingCommentRanges(text, node.pos),
    );

    const selectedDocComments = comments.filter((ranges) =>
        permittedRange(text, ranges, commentStyle),
    );

    return selectedDocComments.map((ranges) => {
        return {
            file: node,
            ranges,
            jsDoc: findJsDocForComment(node, ranges),
        };
    });
}

export function discoverNodeComment(
    node: ts.Node,
    commentStyle: CommentStyle,
): DiscoveredComment | undefined {
    const text = node.getSourceFile().text;
    const comments = collectCommentRanges(
        ts.getLeadingCommentRanges(text, node.pos),
    );
    comments.reverse();

    const selectedDocComment = comments.find((ranges) =>
        permittedRange(text, ranges, commentStyle),
    );

    if (selectedDocComment) {
        return {
            file: node.getSourceFile(),
            ranges: selectedDocComment,
            jsDoc: findJsDocForComment(node, selectedDocComment),
        };
    }
}

export function discoverComment(
    symbol: ts.Symbol,
    kind: ReflectionKind,
    logger: Logger,
    commentStyle: CommentStyle,
): DiscoveredComment | undefined {
    // For a module comment, we want the first one defined in the file,
    // not the last one, since that will apply to the import or declaration.
    const reverse = !symbol.declarations?.some(ts.isSourceFile);

    const discovered: DiscoveredComment[] = [];
    const seen = new Set<ts.Node>();

    for (const decl of symbol.declarations || []) {
        const text = decl.getSourceFile().text;
        if (wantedKinds[kind].includes(decl.kind)) {
            const node = declarationToCommentNode(decl);
            if (!node || seen.has(node)) {
                continue;
            }
            seen.add(node);

            // Special behavior here!
            // Signatures and symbols have two distinct discovery methods as of TypeDoc 0.26.
            // This method discovers comments for symbols, and function-likes will only have
            // a symbol comment if there is more than one signature (== more than one declaration)
            // and there is a comment on the implementation signature.
            if (
                kind & ReflectionKind.ContainsCallSignatures &&
                [
                    ts.SyntaxKind.FunctionDeclaration,
                    ts.SyntaxKind.MethodDeclaration,
                    ts.SyntaxKind.Constructor,
                ].includes(node.kind) &&
                (symbol.declarations!.filter((d) =>
                    wantedKinds[kind].includes(d.kind),
                ).length === 1 ||
                    !(node as ts.FunctionDeclaration).body)
            ) {
                continue;
            }

            const comments = collectCommentRanges(
                ts.getLeadingCommentRanges(text, node.pos),
            );

            if (reverse) {
                comments.reverse();
            }

            const selectedDocComment = comments.find((ranges) =>
                permittedRange(text, ranges, commentStyle),
            );

            if (selectedDocComment) {
                discovered.push({
                    file: decl.getSourceFile(),
                    ranges: selectedDocComment,
                    jsDoc: findJsDocForComment(node, selectedDocComment),
                });
            }
        }
    }

    switch (discovered.length) {
        case 0:
            return undefined;
        case 1:
            return discovered[0];
        default: {
            logger.warn(
                logger.i18n.symbol_0_has_multiple_declarations_with_comment(
                    symbol.name,
                ),
            );
            const locations = discovered.map(({ file, ranges: [{ pos }] }) => {
                const path = nicePath(file.fileName);
                const line =
                    ts.getLineAndCharacterOfPosition(file, pos).line + 1;
                return `${path}:${line}`;
            });
            logger.info(
                logger.i18n.comments_for_0_are_declared_at_1(
                    symbol.name,
                    locations.join("\n\t"),
                ),
            );
            return discovered[0];
        }
    }
}

export function discoverSignatureComment(
    declaration: ts.SignatureDeclaration | ts.JSDocSignature,
    commentStyle: CommentStyle,
): DiscoveredComment | undefined {
    const node = declarationToCommentNode(declaration);
    if (!node) {
        return;
    }

    if (ts.isJSDocSignature(node)) {
        const comment = node.parent.parent;
        ok(ts.isJSDoc(comment));

        return {
            file: node.getSourceFile(),
            ranges: [
                {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    pos: comment.pos,
                    end: comment.end,
                },
            ],
            jsDoc: comment,
        };
    }

    const text = node.getSourceFile().text;

    const comments = collectCommentRanges(
        ts.getLeadingCommentRanges(text, node.pos),
    );
    comments.reverse();

    const comment = comments.find((ranges) =>
        permittedRange(text, ranges, commentStyle),
    );
    if (comment) {
        return {
            file: node.getSourceFile(),
            ranges: comment,
            jsDoc: findJsDocForComment(node, comment),
        };
    }
}

function findJsDocForComment(
    node: ts.Node,
    ranges: ts.CommentRange[],
): ts.JSDoc | undefined {
    if (ranges[0].kind === ts.SyntaxKind.MultiLineCommentTrivia) {
        const jsDocs = ts
            .getJSDocCommentsAndTags(node)
            .map((doc) => ts.findAncestor(doc, ts.isJSDoc)) as ts.JSDoc[];

        return jsDocs.find((doc) => doc.pos === ranges[0].pos);
    }
}

/**
 * Check whether the given module declaration is the topmost.
 *
 * This function returns TRUE if there is no trailing module defined, in
 * the following example this would be the case only for module `C`.
 *
 * ```
 * module A.B.C { }
 * ```
 *
 * @param node  The module definition that should be tested.
 * @return TRUE if the given node is the topmost module declaration, FALSE otherwise.
 */
function isTopmostModuleDeclaration(node: ts.ModuleDeclaration): boolean {
    return node.getChildren().some(ts.isModuleBlock);
}

/**
 * Return the root module declaration of the given module declaration.
 *
 * In the following example this function would always return module
 * `A` no matter which of the modules was passed in.
 *
 * ```
 * module A.B.C { }
 * ```
 */
function getRootModuleDeclaration(node: ts.ModuleDeclaration): ts.Node {
    while (node.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
        const parent = node.parent;
        if (node.name.pos === parent.name.end + 1) {
            node = parent;
        } else {
            break;
        }
    }

    return node;
}

function declarationToCommentNode(node: ts.Declaration): ts.Node | undefined {
    // ts.SourceFile is a counterexample
    if (!node.parent) return node;

    // const abc = 123
    //       ^^^
    if (node.parent.kind === ts.SyntaxKind.VariableDeclarationList) {
        return node.parent.parent;
    }

    // const a = () => {}
    //           ^^^^^^^^
    if (node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
        return node.parent.parent.parent;
    }

    // class X { y = () => {} }
    //               ^^^^^^^^
    // function Z() {}
    // Z.method = () => {}
    //            ^^^^^^^^
    // export default () => {}
    //                ^^^^^^^^
    if (
        [
            ts.SyntaxKind.PropertyDeclaration,
            ts.SyntaxKind.BinaryExpression,
            ts.SyntaxKind.ExportAssignment,
        ].includes(node.parent.kind)
    ) {
        return node.parent;
    }

    if (ts.isModuleDeclaration(node)) {
        if (!isTopmostModuleDeclaration(node)) {
            return;
        } else {
            return getRootModuleDeclaration(node);
        }
    }

    if (node.kind === ts.SyntaxKind.ExportSpecifier) {
        return node.parent.parent;
    }

    if (ts.SyntaxKind.NamespaceExport === node.kind) {
        return node.parent;
    }

    return node;
}

/**
 * Separate comment ranges into arrays so that multiple line comments are kept together
 * and each block comment is left on its own.
 */
function collectCommentRanges(
    ranges: ts.CommentRange[] | undefined,
): ts.CommentRange[][] {
    const result: ts.CommentRange[][] = [];

    let collect: ts.CommentRange[] = [];
    for (const range of ranges || []) {
        collect.push(range);

        switch (range.kind) {
            case ts.SyntaxKind.MultiLineCommentTrivia:
                if (collect.length) {
                    result.push(collect);
                    collect = [];
                }
                result.push([range]);
                break;
            case ts.SyntaxKind.SingleLineCommentTrivia:
                collect.push(range);
                break;
            /* istanbul ignore next */
            default:
                assertNever(range.kind);
        }
    }

    if (collect.length) {
        result.push(collect);
    }

    return result;
}

function permittedRange(
    text: string,
    ranges: ts.CommentRange[],
    commentStyle: CommentStyle,
): boolean {
    switch (commentStyle) {
        case CommentStyle.All:
            return true;
        case CommentStyle.Block:
            return ranges[0].kind === ts.SyntaxKind.MultiLineCommentTrivia;
        case CommentStyle.Line:
            return ranges[0].kind === ts.SyntaxKind.SingleLineCommentTrivia;
        case CommentStyle.JSDoc:
            return (
                ranges[0].kind === ts.SyntaxKind.MultiLineCommentTrivia &&
                text[ranges[0].pos] === "/" &&
                text[ranges[0].pos + 1] === "*" &&
                text[ranges[0].pos + 2] === "*"
            );
    }
}
