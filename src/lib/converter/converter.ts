import * as ts from "typescript";

import type { Application } from "../application";
import { ProjectReflection, ReflectionKind, SomeType } from "../models/index";
import { Context } from "./context";
import { ConverterComponent } from "./components";
import { Component, ChildableComponent } from "../utils/component";
import { BindOption } from "../utils";
import { convertType } from "./types";
import { ConverterEvents } from "./converter-events";
import { convertSymbol } from "./symbols";
import { createMinimatch, matchesAny } from "../utils/paths";
import type { IMinimatch } from "minimatch";
import { hasAllFlags, hasAnyFlag } from "../utils/enum";
import { resolveAliasedSymbol } from "./utils/symbols";
import type { DocumentationEntryPoint } from "../utils/entry-point";

/**
 * Compiles source files using TypeScript and converts compiler symbols to reflections.
 */
@Component({
    name: "converter",
    internal: true,
    childClass: ConverterComponent,
})
export class Converter extends ChildableComponent<
    Application,
    ConverterComponent
> {
    /**
     * The human readable name of the project. Used within the templates to set the title of the document.
     */
    @BindOption("name")
    name!: string;

    @BindOption("externalPattern")
    externalPattern!: string[];
    private externalPatternCache?: IMinimatch[];
    private excludeCache?: IMinimatch[];

    @BindOption("excludeExternals")
    excludeExternals!: boolean;

    @BindOption("excludeNotDocumented")
    excludeNotDocumented!: boolean;

    @BindOption("excludePrivate")
    excludePrivate!: boolean;

    @BindOption("excludeProtected")
    excludeProtected!: boolean;

    /**
     * General events
     */

    /**
     * Triggered when the converter begins converting a project.
     * The listener will be given a {@link Context} object.
     * @event
     */
    static readonly EVENT_BEGIN = ConverterEvents.BEGIN;

    /**
     * Triggered when the converter has finished converting a project.
     * The listener will be given a {@link Context} object.
     * @event
     */
    static readonly EVENT_END = ConverterEvents.END;

    /**
     * Factory events
     */

    /**
     * Triggered when the converter has created a declaration reflection.
     * The listener will be given {@link Context} and a {@link DeclarationReflection}.
     * @event
     */
    static readonly EVENT_CREATE_DECLARATION =
        ConverterEvents.CREATE_DECLARATION;

    /**
     * Triggered when the converter has created a signature reflection.
     * The listener will be given {@link Context}, {@link SignatureReflection} | {@link ProjectReflection} and a `ts.Node?`
     * @event
     */
    static readonly EVENT_CREATE_SIGNATURE = ConverterEvents.CREATE_SIGNATURE;

    /**
     * Triggered when the converter has created a parameter reflection.
     * The listener will be given {@link Context}, {@link ParameterReflection} and a `ts.Node?`
     * @event
     */
    static readonly EVENT_CREATE_PARAMETER = ConverterEvents.CREATE_PARAMETER;

    /**
     * Triggered when the converter has created a type parameter reflection.
     * The listener will be given {@link Context} and a {@link TypeParameterReflection}
     * @event
     */
    static readonly EVENT_CREATE_TYPE_PARAMETER =
        ConverterEvents.CREATE_TYPE_PARAMETER;

    /**
     * Resolve events
     */

    /**
     * Triggered when the converter begins resolving a project.
     * The listener will be given {@link Context}.
     * @event
     */
    static readonly EVENT_RESOLVE_BEGIN = ConverterEvents.RESOLVE_BEGIN;

    /**
     * Triggered when the converter resolves a reflection.
     * The listener will be given {@link Context} and a {@link Reflection}.
     * @event
     */
    static readonly EVENT_RESOLVE = ConverterEvents.RESOLVE;

    /**
     * Triggered when the converter has finished resolving a project.
     * The listener will be given {@link Context}.
     * @event
     */
    static readonly EVENT_RESOLVE_END = ConverterEvents.RESOLVE_END;

    /**
     * Compile the given source files and create a project reflection for them.
     */
    convert(
        entryPoints: readonly DocumentationEntryPoint[]
    ): ProjectReflection {
        const programs = entryPoints.map((e) => e.program);
        this.externalPatternCache = void 0;

        const project = new ProjectReflection(this.name);
        const context = new Context(this, programs, project);

        this.trigger(Converter.EVENT_BEGIN, context);

        this.compile(entryPoints, context);
        this.resolve(context);
        // This should only do anything if a plugin does something bad.
        project.removeDanglingReferences();

        this.trigger(Converter.EVENT_END, context);

        return project;
    }

    /** @internal */
    convertSymbol(context: Context, symbol: ts.Symbol) {
        convertSymbol(context, symbol);
    }

    /**
     * Convert the given TypeScript type into its TypeDoc type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param referenceTarget The target to be used to attempt to resolve reference types
     * @returns The TypeDoc type reflection representing the given node and type.
     * @internal
     */
    convertType(
        context: Context,
        node: ts.TypeNode | ts.Type | undefined
    ): SomeType {
        return convertType(context, node);
    }

    /** @internal */
    getNodesForSymbol(symbol: ts.Symbol, kind: ReflectionKind) {
        const wantedKinds: ts.SyntaxKind[] = {
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
            [ReflectionKind.ConstructorSignature]: [
                ts.SyntaxKind.ConstructSignature,
            ],
            [ReflectionKind.Parameter]: [ts.SyntaxKind.Parameter],
            [ReflectionKind.TypeLiteral]: [ts.SyntaxKind.TypeLiteral],
            [ReflectionKind.TypeParameter]: [ts.SyntaxKind.TypeParameter],
            [ReflectionKind.Accessor]: [
                ts.SyntaxKind.GetAccessor,
                ts.SyntaxKind.SetAccessor,
            ],
            [ReflectionKind.GetSignature]: [ts.SyntaxKind.GetAccessor],
            [ReflectionKind.SetSignature]: [ts.SyntaxKind.SetAccessor],
            [ReflectionKind.ObjectLiteral]: [
                ts.SyntaxKind.ObjectLiteralExpression,
            ],
            [ReflectionKind.TypeAlias]: [
                ts.SyntaxKind.TypeAliasDeclaration,
                ts.SyntaxKind.JSDocTypedefTag,
            ],
            [ReflectionKind.Event]: [], /// this needs to go away
            [ReflectionKind.Reference]: [
                ts.SyntaxKind.NamespaceExport,
                ts.SyntaxKind.ExportSpecifier,
            ],
        }[kind];

        const declarations = symbol.getDeclarations() ?? [];
        return declarations.filter((d) => wantedKinds.includes(d.kind));
    }

    /**
     * Compile the files within the given context and convert the compiler symbols to reflections.
     *
     * @param context  The context object describing the current state the converter is in.
     * @returns An array containing all errors generated by the TypeScript compiler.
     */
    private compile(
        entryPoints: readonly DocumentationEntryPoint[],
        context: Context
    ) {
        const entries = entryPoints.map((e) => {
            return {
                entryPoint: e,
                context: undefined as Context | undefined,
            };
        });
        entries.forEach((e) => {
            context.setActiveProgram(e.entryPoint.program);
            e.context = this.convertExports(
                context,
                e.entryPoint.sourceFile,
                entries.length === 1,
                e.entryPoint.displayName
            );
        });
        for (const { entryPoint, context } of entries) {
            // active program is already set on context
            // if we don't have a context, then this entry point is being ignored
            if (context) {
                this.convertReExports(context, entryPoint.sourceFile);
            }
        }
        context.setActiveProgram(undefined);
    }

    private convertExports(
        context: Context,
        node: ts.SourceFile,
        singleEntryPoint: boolean,
        entryName: string
    ) {
        const symbol = getSymbolForModuleLike(context, node);
        let moduleContext: Context;

        const allExports = getExports(context, node, symbol);

        if (
            allExports.every((exp) => this.shouldIgnore(exp, context.checker))
        ) {
            this.owner.logger.verbose(
                `Ignoring entry point ${entryName} since all members will be ignored.`
            );
            return;
        }

        if (singleEntryPoint) {
            // Special case for when we're giving a single entry point, we don't need to
            // create modules for each entry. Register the project as this module.
            context.project.registerReflection(context.project, symbol);
            context.trigger(
                Converter.EVENT_CREATE_DECLARATION,
                context.project
            );
            moduleContext = context;
        } else {
            const reflection = context.createDeclarationReflection(
                ReflectionKind.Module,
                symbol,
                void 0,
                entryName
            );
            context.finalizeDeclarationReflection(reflection);
            moduleContext = context.withScope(reflection);
        }

        for (const exp of allExports.filter((exp) =>
            isDirectExport(context.resolveAliasedSymbol(exp), node)
        )) {
            convertSymbol(moduleContext, exp);
        }

        return moduleContext;
    }

    private convertReExports(moduleContext: Context, node: ts.SourceFile) {
        for (const exp of getExports(
            moduleContext,
            node,
            moduleContext.project.getSymbolFromReflection(moduleContext.scope)
        ).filter(
            (exp) =>
                !isDirectExport(moduleContext.resolveAliasedSymbol(exp), node)
        )) {
            convertSymbol(moduleContext, exp);
        }
    }

    /**
     * Resolve the project within the given context.
     *
     * @param context  The context object describing the current state the converter is in.
     * @returns The final project reflection.
     */
    private resolve(context: Context): void {
        this.trigger(Converter.EVENT_RESOLVE_BEGIN, context);
        const project = context.project;

        for (const reflection of Object.values(project.reflections)) {
            this.trigger(Converter.EVENT_RESOLVE, context, reflection);
        }

        this.trigger(Converter.EVENT_RESOLVE_END, context);
    }

    /** @internal */
    shouldIgnore(symbol: ts.Symbol, checker: ts.TypeChecker) {
        if (
            this.excludeNotDocumented &&
            // If the enum is included, we should include members even if not documented.
            !hasAllFlags(symbol.flags, ts.SymbolFlags.EnumMember) &&
            resolveAliasedSymbol(symbol, checker).getDocumentationComment(
                checker
            ).length === 0
        ) {
            return true;
        }

        if (this.isExcluded(symbol)) {
            return true;
        }

        if (!this.excludeExternals) {
            return false;
        }

        return this.isExternal(symbol);
    }

    private isExcluded(symbol: ts.Symbol) {
        this.excludeCache ??= createMinimatch(
            this.application.options.getValue("exclude")
        );
        const cache = this.excludeCache;

        return (symbol.getDeclarations() ?? []).some((node) =>
            matchesAny(cache, node.getSourceFile().fileName)
        );
    }

    /** @internal */
    isExternal(symbol: ts.Symbol) {
        this.externalPatternCache ??= createMinimatch(this.externalPattern);
        const cache = this.externalPatternCache;

        return (symbol.getDeclarations() ?? []).some((node) =>
            matchesAny(cache, node.getSourceFile().fileName)
        );
    }
}

function getSymbolForModuleLike(
    context: Context,
    node: ts.SourceFile | ts.ModuleBlock
) {
    const symbol = context.checker.getSymbolAtLocation(node) ?? node.symbol;

    if (symbol) {
        return symbol;
    }

    // This is a global file, get all symbols declared in this file...
    // this isn't the best solution, it would be nice to have all globals given to a special
    // "globals" file, but this is uncommon enough that I'm skipping it for now.
    const sourceFile = node.getSourceFile();
    const globalSymbols = context.checker
        .getSymbolsInScope(node, ts.SymbolFlags.ModuleMember)
        .filter((s) =>
            s.getDeclarations()?.some((d) => d.getSourceFile() === sourceFile)
        );

    // Detect declaration files with declare module "foo" as their only export
    // and lift that up one level as the source file symbol
    if (
        globalSymbols.length === 1 &&
        globalSymbols[0]
            .getDeclarations()
            ?.every(
                (declaration) =>
                    ts.isModuleDeclaration(declaration) &&
                    ts.isStringLiteral(declaration.name)
            )
    ) {
        return globalSymbols[0];
    }
}

function getExports(
    context: Context,
    node: ts.SourceFile | ts.ModuleBlock,
    symbol: ts.Symbol | undefined
): ts.Symbol[] {
    let result: ts.Symbol[];

    // The generated docs aren't great, but you really ought not be using
    // this in the first place... so it's better than nothing.
    const exportEq = symbol?.exports?.get("export=" as ts.__String);
    if (exportEq) {
        // JS users might also have exported types here.
        // We need to filter for types because otherwise static methods can show up as both
        // members of the export= class and as functions if a class is directly exported.
        result = [exportEq].concat(
            context.checker
                .getExportsOfModule(symbol!)
                .filter(
                    (s) =>
                        !hasAnyFlag(
                            s.flags,
                            ts.SymbolFlags.Prototype | ts.SymbolFlags.Value
                        )
                )
        );
    } else if (symbol) {
        result = context.checker
            .getExportsOfModule(symbol)
            .filter((s) => !hasAllFlags(s.flags, ts.SymbolFlags.Prototype));
    } else {
        // Global file with no inferred top level symbol, get all symbols declared in this file.
        const sourceFile = node.getSourceFile();
        result = context.checker
            .getSymbolsInScope(node, ts.SymbolFlags.ModuleMember)
            .filter((s) =>
                s
                    .getDeclarations()
                    ?.some((d) => d.getSourceFile() === sourceFile)
            );
    }

    // Put symbols named "default" last, #1795
    result.sort((a, b) => {
        if (a.name === "default") {
            return 1;
        } else if (b.name === "default") {
            return -1;
        }
        return 0;
    });

    return result;
}

function isDirectExport(symbol: ts.Symbol, file: ts.SourceFile): boolean {
    return (
        symbol
            .getDeclarations()
            ?.every((decl) => decl.getSourceFile() === file) ?? false
    );
}
