import { ok as assert } from "assert";
import ts from "typescript";

import {
    type Reflection,
    type ProjectReflection,
    ContainerReflection,
    DeclarationReflection,
    type DocumentReflection,
    ReflectionKind,
    ReflectionFlag,
} from "../models/index";

import type { Converter } from "./converter";
import { isNamedNode } from "./utils/nodes";
import { ConverterEvents } from "./converter-events";
import { resolveAliasedSymbol } from "./utils/symbols";
import {
    getComment,
    getFileComment,
    getJsDocComment,
    getNodeComment,
    getSignatureComment,
} from "./comments";
import { getHumanName } from "../utils/tsutils";
import type { TranslationProxy } from "../internationalization/internationalization";

/**
 * The context describes the current state the converter is in.
 */
export class Context {
    /**
     * The converter instance that has created the context.
     */
    readonly converter: Converter;

    /**
     * The TypeChecker instance returned by the TypeScript compiler.
     */
    get checker(): ts.TypeChecker {
        return this.program.getTypeChecker();
    }

    /**
     * Translation interface for log messages.
     */
    get i18n(): TranslationProxy {
        return this.converter.application.i18n;
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
        scope: Context["scope"] = project,
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
                `Expected a symbol for node with kind ${
                    ts.SyntaxKind[node.kind]
                } at ${node.getSourceFile().fileName}:${line + 1}`,
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
            reflection.escapedName = symbol?.escapedName;
            this.addChild(reflection);
        }

        if (symbol && this.converter.isExternal(symbol)) {
            reflection.setFlag(ReflectionFlag.External);
        }
        if (exportSymbol) {
            this.registerReflection(reflection, exportSymbol);
        }

        const path = reflection.kindOf(
            ReflectionKind.Namespace | ReflectionKind.Module,
        )
            ? symbol?.declarations?.find(ts.isSourceFile)?.fileName
            : undefined;
        this.project.registerReflection(reflection, symbol, path);
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
    registerReflection(reflection: Reflection, symbol: ts.Symbol | undefined) {
        this.project.registerReflection(reflection, symbol, void 0);
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
            this.converter.commentStyle,
            this.converter.useTsLinkResolution ? this.checker : undefined,
            this.project.files,
        );
    }

    getNodeComment(node: ts.Node, moduleComment: boolean) {
        return getNodeComment(
            node,
            moduleComment,
            this.converter.config,
            this.logger,
            this.converter.commentStyle,
            this.converter.useTsLinkResolution ? this.checker : undefined,
            this.project.files,
        );
    }

    getFileComment(node: ts.SourceFile) {
        return getFileComment(
            node,
            this.converter.config,
            this.logger,
            this.converter.commentStyle,
            this.converter.useTsLinkResolution ? this.checker : undefined,
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
            this.converter.useTsLinkResolution ? this.checker : undefined,
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
            this.converter.commentStyle,
            this.converter.useTsLinkResolution ? this.checker : undefined,
            this.project.files,
        );
    }

    public withScope(scope: Reflection): Context {
        const context = new Context(
            this.converter,
            this.programs,
            this.project,
            scope,
        );
        context.convertingTypeNode = this.convertingTypeNode;
        context.setActiveProgram(this._program);
        return context;
    }
}
