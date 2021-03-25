import { ok as assert } from "assert";
import * as ts from "typescript";

import {
    Reflection,
    ProjectReflection,
    ContainerReflection,
    DeclarationReflection,
    ReflectionKind,
    ReflectionFlag,
} from "../models/index";

import type { Converter } from "./converter";
import { isNamedNode } from "./utils/nodes";
import { ConverterEvents } from "./converter-events";
import { resolveAliasedSymbol } from "./utils/symbols";

/**
 * The context describes the current state the converter is in.
 * @internal
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
     * The program currently being converted.
     * Accessing this property will throw if a source file is not currently being converted.
     */
    get program(): ts.Program {
        assert(
            this._program,
            "Tried to access Context.program when not converting a source file"
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

    /** @internal */
    isConvertingTypeNode(): boolean {
        return this.convertingTypeNode;
    }

    /** @internal */
    setConvertingTypeNode() {
        this.convertingTypeNode = true;
    }

    /**
     * This is a horrible hack to avoid breaking backwards compatibility for plugins
     * that use EVENT_CREATE_DECLARATION. The comment plugin needs to be able to check
     * this to properly get the comment for module re-exports:
     * ```ts
     * /** We should use this comment *&#47;
     * export * as Mod from "./mod"
     * ```
     * Will be removed in 0.21.
     * @internal
     */
    exportSymbol?: ts.Symbol;

    /** @internal */
    shouldBeStatic = false;

    private convertingTypeNode = false;

    /**
     * Create a new Context instance.
     *
     * @param converter  The converter instance that has created the context.
     * @param entryPoints  A list of all entry points for this project.
     * @param checker  The TypeChecker instance returned by the TypeScript compiler.
     * @internal
     */
    constructor(
        converter: Converter,
        programs: readonly ts.Program[],
        project: ProjectReflection,
        scope: Context["scope"] = project
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
     * Return the compiler options.
     */
    getCompilerOptions(): ts.CompilerOptions {
        return this.converter.application.options.getCompilerOptions();
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
            } else if (node.parent && node.parent.symbol) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(
                    node.parent.symbol
                );
            } else if (
                node.parent &&
                node.parent.parent &&
                node.parent.parent.symbol
            ) {
                nodeType = this.checker.getDeclaredTypeOfSymbol(
                    node.parent.parent.symbol
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
                node.pos
            );
            throw new Error(
                `Expected a symbol for node with kind ${
                    ts.SyntaxKind[node.kind]
                } at ${node.getSourceFile().fileName}:${line + 1}`
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
        nameOverride?: string
    ) {
        const name = getHumanName(
            nameOverride ?? exportSymbol?.name ?? symbol?.name ?? "unknown"
        );
        const reflection = new DeclarationReflection(name, kind, this.scope);
        if (this.shouldBeStatic) {
            reflection.setFlag(ReflectionFlag.Static);
        }
        reflection.escapedName = symbol?.escapedName;

        this.addChild(reflection);
        if (symbol && this.converter.isExternal(symbol)) {
            reflection.setFlag(ReflectionFlag.External);
        }
        if (exportSymbol) {
            this.registerReflection(reflection, exportSymbol);
        }
        this.registerReflection(reflection, symbol);

        return reflection;
    }

    finalizeDeclarationReflection(
        reflection: DeclarationReflection,
        symbol: ts.Symbol | undefined,
        exportSymbol?: ts.Symbol,
        commentNode?: ts.Node
    ) {
        this.exportSymbol = exportSymbol;
        this.converter.trigger(
            ConverterEvents.CREATE_DECLARATION,
            this,
            reflection,
            (symbol &&
                this.converter.getNodesForSymbol(symbol, reflection.kind)[0]) ??
                commentNode
        );
        this.exportSymbol = undefined;
    }

    addChild(reflection: DeclarationReflection) {
        if (this.scope instanceof ContainerReflection) {
            this.scope.children ??= [];
            this.scope.children.push(reflection);
        }
    }

    shouldIgnore(symbol: ts.Symbol) {
        return this.converter.shouldIgnore(symbol, this.checker);
    }

    /**
     * Register a newly generated reflection. All created reflections should be
     * passed to this method to ensure that the project helper functions work correctly.
     *
     * @param reflection  The reflection that should be registered.
     * @param symbol  The symbol the given reflection was resolved from.
     */
    registerReflection(reflection: Reflection, symbol: ts.Symbol | undefined) {
        this.project.registerReflection(reflection, symbol);
    }

    /**
     * Trigger a node reflection event.
     *
     * All events are dispatched on the current converter instance.
     *
     * @param name  The name of the event that should be triggered.
     * @param reflection  The triggering reflection.
     * @param node  The triggering TypeScript node if available.
     */
    trigger(name: string, reflection: Reflection, node?: ts.Node) {
        this.converter.trigger(name, this, reflection, node);
    }

    /** @internal */
    setActiveProgram(program: ts.Program | undefined) {
        this._program = program;
    }

    /**
     * @param callback  The callback function that should be executed with the changed context.
     */
    public withScope(scope: Reflection): Context {
        const context = new Context(
            this.converter,
            this.programs,
            this.project,
            scope
        );
        context.convertingTypeNode = this.convertingTypeNode;
        context.setActiveProgram(this._program);
        return context;
    }
}

const builtInSymbolRegExp = /^__@(\w+)$/;
const uniqueSymbolRegExp = /^__@(.*)@\d+$/;

function getHumanName(name: string) {
    let match = builtInSymbolRegExp.exec(name);
    if (match) {
        return `[Symbol.${match[1]}]`;
    }

    match = uniqueSymbolRegExp.exec(name);
    if (match) {
        return `[${match[1]}]`;
    }

    return name;
}
