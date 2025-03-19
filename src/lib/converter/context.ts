import { ok as assert } from "assert";
import ts from "typescript";

import {
    Comment,
    ContainerReflection,
    DeclarationReflection,
    type DocumentReflection,
    type ProjectReflection,
    ReferenceType,
    type Reflection,
    ReflectionFlag,
    ReflectionKind,
} from "../models/index.js";

import type { Converter } from "./converter.js";
import { isNamedNode } from "./utils/nodes.js";
import { ConverterEvents } from "./converter-events.js";
import { resolveAliasedSymbol } from "./utils/symbols.js";
import { getComment, getFileComment, getJsDocComment, getNodeComment, getSignatureComment } from "./comments/index.js";
import { getHumanName, getQualifiedName } from "../utils/tsutils.js";
import { type FileSystem, findPackageForPath, normalizePath } from "#node-utils";
import { createSymbolId } from "./factories/symbol-id.js";
import { type NormalizedPath, removeIf } from "#utils";

/**
 * The context describes the current state the converter is in.
 */
export class Context {
    /**
     * The converter instance that has created the context.
     */
    readonly converter: Converter;

    /**
     * The filesystem object to interact with the filesystem.
     */
    get fs(): FileSystem {
        return this.converter.application.fs;
    }

    /**
     * The TypeChecker instance returned by the TypeScript compiler.
     */
    get checker(): ts.TypeChecker {
        return this.program.getTypeChecker();
    }

    /**
     * The program currently being converted.
     * Accessing this property will throw if a source file is not currently being converted.
     */
    get program(): ts.Program {
        assert(
            this._program,
            "Tried to access Context.program when not converting a source file",
        );
        return this._program;
    }
    private _program?: ts.Program;

    /**
     * All programs being converted.
     */
    readonly programs: readonly ts.Program[];

    /**
     * The project that is currently processed.
     */
    readonly project: ProjectReflection;

    /**
     * The scope or parent reflection that is currently processed.
     */
    readonly scope: Reflection;

    convertingTypeNode = false; // Inherited by withScope
    convertingClassOrInterface = false; // Not inherited
    shouldBeStatic = false; // Not inherited
    inlineType = new Set<string>(); // Inherited by withScope
    preventInline = new Set<string>(); // Inherited by withScope

    private reflectionIdToSymbolMap = new Map<number, ts.Symbol>();

    /**
     * Create a new Context instance.
     *
     * @param converter  The converter instance that has created the context.
     * @internal
     */
    constructor(
        converter: Converter,
        programs: readonly ts.Program[],
        project: ProjectReflection,
        scope: Reflection = project,
    ) {
        this.converter = converter;
        this.programs = programs;

        this.project = project;
        this.scope = scope;
    }

    /** @internal */
    get logger() {
        return this.converter.application.logger;
    }

    /**
     * Return the type declaration of the given node.
     *
     * @param node  The TypeScript node whose type should be resolved.
     * @returns The type declaration of the given node.
     */
    getTypeAtLocation(node: ts.Node): ts.Type | undefined {
        let nodeType: ts.Type | undefined;
        try {
            nodeType = this.checker.getTypeAtLocation(node);
        } catch {
            // ignore
        }
        if (!nodeType) {
            if (node.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(node.symbol);
                // The TS types lie due to ts.SourceFile
            } else if (node.parent?.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(
                    node.parent.symbol,
                );
                // The TS types lie due to ts.SourceFile
            } else if (node.parent?.parent?.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(
                    node.parent.parent.symbol,
                );
            }
        }
        return nodeType;
    }

    getSymbolAtLocation(node: ts.Node): ts.Symbol | undefined {
        let symbol = this.checker.getSymbolAtLocation(node);
        if (!symbol && isNamedNode(node)) {
            symbol = this.checker.getSymbolAtLocation(node.name);
        }
        return symbol;
    }

    expectSymbolAtLocation(node: ts.Node): ts.Symbol {
        const symbol = this.getSymbolAtLocation(node);
        if (!symbol) {
            const { line } = ts.getLineAndCharacterOfPosition(
                node.getSourceFile(),
                node.pos,
            );
            throw new Error(
                `Expected a symbol for node with kind ${ts.SyntaxKind[node.kind]} at ${node.getSourceFile().fileName}:${
                    line + 1
                }`,
            );
        }
        return symbol;
    }

    resolveAliasedSymbol(symbol: ts.Symbol): ts.Symbol {
        return resolveAliasedSymbol(symbol, this.checker);
    }

    createDeclarationReflection(
        kind: ReflectionKind,
        symbol: ts.Symbol | undefined,
        exportSymbol: ts.Symbol | undefined,
        // We need this because modules don't always have symbols.
        nameOverride?: string,
    ) {
        const name = getHumanName(
            nameOverride ?? exportSymbol?.name ?? symbol?.name ?? "unknown",
        );

        if (this.convertingClassOrInterface) {
            if (kind === ReflectionKind.Function) {
                kind = ReflectionKind.Method;
            }
            if (kind === ReflectionKind.Variable) {
                kind = ReflectionKind.Property;
            }
        }

        const reflection = new DeclarationReflection(name, kind, this.scope);
        this.postReflectionCreation(reflection, symbol, exportSymbol);

        return reflection;
    }

    postReflectionCreation(
        reflection: Reflection,
        symbol: ts.Symbol | undefined,
        exportSymbol: ts.Symbol | undefined,
    ) {
        if (
            exportSymbol &&
            reflection.kind &
                (ReflectionKind.SomeModule | ReflectionKind.Reference)
        ) {
            reflection.comment = this.getComment(exportSymbol, reflection.kind);
        }
        if (symbol && !reflection.comment) {
            reflection.comment = this.getComment(symbol, reflection.kind);
        }

        if (this.shouldBeStatic) {
            reflection.setFlag(ReflectionFlag.Static);
        }

        if (reflection instanceof DeclarationReflection) {
            reflection.escapedName = symbol?.escapedName ? String(symbol.escapedName) : undefined;
            this.addChild(reflection);
        }

        if (symbol && this.converter.isExternal(symbol)) {
            reflection.setFlag(ReflectionFlag.External);
        }
        if (exportSymbol) {
            this.registerReflection(reflection, exportSymbol, void 0);
        }

        const path = reflection.kindOf(
                ReflectionKind.Namespace | ReflectionKind.Module,
            )
            ? symbol?.declarations?.find(ts.isSourceFile)?.fileName
            : undefined;

        if (path) {
            this.registerReflection(reflection, symbol, normalizePath(path));
        } else {
            this.registerReflection(reflection, symbol, undefined);
        }
    }

    finalizeDeclarationReflection(reflection: DeclarationReflection) {
        this.converter.trigger(
            ConverterEvents.CREATE_DECLARATION,
            this,
            reflection,
        );

        if (reflection.kindOf(ReflectionKind.MayContainDocuments)) {
            this.converter.processDocumentTags(reflection, reflection);
        }
    }

    /**
     * Create a {@link ReferenceType} which points to the provided symbol.
     *
     * @privateRemarks
     * This is available on Context so that it can be monkey-patched by typedoc-plugin-missing-exports
     */
    createSymbolReference(
        symbol: ts.Symbol,
        context: Context,
        name?: string,
    ): ReferenceType {
        const ref = ReferenceType.createUnresolvedReference(
            name ?? symbol.name,
            createSymbolId(this.fs, symbol),
            context.project,
            getQualifiedName(symbol, name ?? symbol.name),
        );
        ref.refersToTypeParameter = !!(
            symbol.flags & ts.SymbolFlags.TypeParameter
        );

        const symbolPath = symbol.declarations?.[0]?.getSourceFile().fileName;
        if (!symbolPath) return ref;

        ref.package = findPackageForPath(symbolPath, this.fs)?.[0];
        return ref;
    }

    addChild(reflection: DeclarationReflection | DocumentReflection) {
        if (this.scope instanceof ContainerReflection) {
            this.scope.addChild(reflection);
        }
    }

    shouldIgnore(symbol: ts.Symbol) {
        return this.converter.shouldIgnore(symbol);
    }

    /**
     * Register a newly generated reflection. All created reflections should be
     * passed to this method to ensure that the project helper functions work correctly.
     *
     * @param reflection  The reflection that should be registered.
     * @param symbol  The symbol the given reflection was resolved from.
     */
    registerReflection(reflection: Reflection, symbol: ts.Symbol | undefined, filePath?: NormalizedPath) {
        if (symbol) {
            this.reflectionIdToSymbolMap.set(reflection.id, symbol);
            const id = createSymbolId(this.fs, symbol);

            // #2466
            // If we just registered a member of a class or interface, then we need to check if
            // we've registered this symbol before under the wrong parent reflection.
            // This can happen because the compiler API will use non-dependently-typed symbols
            // for properties of classes/interfaces which inherit them, so we can't rely on the
            // property being unique for each class.
            if (
                reflection.parent?.kindOf(ReflectionKind.ClassOrInterface) &&
                reflection.kindOf(ReflectionKind.SomeMember)
            ) {
                const saved = this.project["symbolToReflectionIdMap"].get(id);
                const parentSymbolReflection = symbol.parent &&
                    this.getReflectionFromSymbol(symbol.parent);

                if (
                    typeof saved === "object" &&
                    saved.length > 1 &&
                    parentSymbolReflection
                ) {
                    removeIf(
                        saved,
                        (item) =>
                            this.project.getReflectionById(item)?.parent !==
                                parentSymbolReflection,
                    );
                }
            }

            this.project.registerReflection(reflection, id, filePath);
        } else {
            this.project.registerReflection(reflection, void 0, filePath);
        }
    }

    getReflectionFromSymbol(symbol: ts.Symbol) {
        return this.project.getReflectionFromSymbolId(createSymbolId(this.fs, symbol));
    }

    getSymbolFromReflection(reflection: Reflection) {
        return this.reflectionIdToSymbolMap.get(reflection.id);
    }

    /** @internal */
    setActiveProgram(program: ts.Program | undefined) {
        this._program = program;
    }

    getComment(symbol: ts.Symbol, kind: ReflectionKind) {
        return getComment(
            symbol,
            kind,
            this.converter.config,
            this.logger,
            this.checker,
            this.project.files,
        );
    }

    getNodeComment(node: ts.Node, moduleComment: boolean) {
        return getNodeComment(
            node,
            moduleComment,
            this.converter.config,
            this.logger,
            this.checker,
            this.project.files,
        );
    }

    getFileComment(node: ts.SourceFile) {
        return getFileComment(
            node,
            this.converter.config,
            this.logger,
            this.checker,
            this.project.files,
        );
    }

    getJsDocComment(
        declaration:
            | ts.JSDocPropertyLikeTag
            | ts.JSDocCallbackTag
            | ts.JSDocTypedefTag
            | ts.JSDocTemplateTag
            | ts.JSDocEnumTag,
    ) {
        return getJsDocComment(
            declaration,
            this.converter.config,
            this.logger,
            this.checker,
            this.project.files,
        );
    }

    getSignatureComment(
        declaration: ts.SignatureDeclaration | ts.JSDocSignature,
    ) {
        return getSignatureComment(
            declaration,
            this.converter.config,
            this.logger,
            this.checker,
            this.project.files,
        );
    }

    shouldInline(symbol: ts.Symbol, name: string): boolean {
        if (this.preventInline.has(name)) return false;
        if (this.inlineType.has(name)) return true;

        return this
            .getComment(symbol, ReflectionKind.Interface)
            ?.hasModifier("@inline") ?? false;
    }

    public withScope(scope: Reflection): Context {
        assert(scope.parent === this.scope || scope === this.scope, "Incorrect context used for withScope");

        const context = new Context(
            this.converter,
            this.programs,
            this.project,
            scope,
        );
        context.convertingTypeNode = this.convertingTypeNode;
        context.setActiveProgram(this._program);
        context.reflectionIdToSymbolMap = this.reflectionIdToSymbolMap;
        context.preventInline = new Set(this.preventInline);
        context.inlineType = new Set(this.inlineType);

        for (const tag of scope.comment?.blockTags || []) {
            if (tag.tag === "@preventInline") {
                context.preventInline.add(Comment.combineDisplayParts(tag.content));
            } else if (tag.tag === "@inlineType") {
                context.inlineType.add(Comment.combineDisplayParts(tag.content));
            }
        }

        return context;
    }
}
