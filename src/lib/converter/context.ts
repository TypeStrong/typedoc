import * as ts from "typescript";

import {
    Reflection,
    ProjectReflection,
    ContainerReflection,
    DeclarationReflection,
    ReflectionKind,
} from "../models/index";

import type { Converter } from "./converter";
import { isNamedNode } from "./utils/nodes";
import { ConverterEvents } from "./converter-events";

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
    readonly checker: ts.TypeChecker;

    /**
     * The program being converted.
     */
    readonly program: ts.Program;

    /**
     * The project that is currently processed.
     */
    readonly project: ProjectReflection;

    /**
     * The scope or parent reflection that is currently processed.
     */
    readonly scope: Reflection;

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
        checker: ts.TypeChecker,
        program: ts.Program,
        project = new ProjectReflection(converter.name),
        scope: Context["scope"] = project
    ) {
        this.converter = converter;
        this.checker = checker;
        this.program = program;

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

    resolveAliasedSymbol(symbol: ts.Symbol): ts.Symbol;
    resolveAliasedSymbol(symbol: ts.Symbol | undefined): ts.Symbol | undefined;
    resolveAliasedSymbol(symbol: ts.Symbol | undefined) {
        while (symbol && ts.SymbolFlags.Alias & symbol.flags) {
            symbol = this.checker.getAliasedSymbol(symbol);
        }
        return symbol;
    }

    createDeclarationReflection(
        kind: ReflectionKind,
        symbol: ts.Symbol,
        name = getHumanName(symbol.name)
    ) {
        const reflection = new DeclarationReflection(name, kind, this.scope);
        this.addChild(reflection);
        this.registerReflection(reflection, symbol);

        this.converter.trigger(
            ConverterEvents.CREATE_DECLARATION,
            this,
            reflection,
            // FIXME this isn't good enough.
            this.converter.getNodesForSymbol(symbol, kind)[0]
        );

        return reflection;
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

    /**
     * @param callback  The callback function that should be executed with the changed context.
     */
    public withScope(scope: Reflection): Context {
        const context = new Context(
            this.converter,
            this.checker,
            this.program,
            this.project,
            scope
        );
        return context;
    }
}

const builtInSymbolRegExp = /^__@(\w+)$/;

function getHumanName(name: string) {
    const match = builtInSymbolRegExp.exec(name);
    if (match) {
        return `[Symbol.${match[1]}]`;
    }
    return name;
}
