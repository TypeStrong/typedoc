import * as ts from "typescript";
import * as _ts from "../ts-internal";
import * as _ from "lodash";
import * as assert from "assert";

import { Application } from "../application";
import {
    Type,
    ProjectReflection,
    ReflectionKind,
    ContainerReflection,
    DeclarationReflection,
} from "../models/index";
import { Context } from "./context";
import { ConverterComponent } from "./components";
import { Component, ChildableComponent } from "../utils/component";
import { BindOption, normalizePath } from "../utils";
import { convertType } from "./types";
import { ConverterEvents } from "./converter-events";
import { convertSymbol } from "./symbols";
import { relative } from "path";
import { getCommonDirectory } from "../utils/fs";
import { createMinimatch } from "../utils/paths";
import { IMinimatch } from "minimatch";
import { hasFlag } from "../utils/enum";

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
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static readonly EVENT_BEGIN = ConverterEvents.BEGIN;

    /**
     * Triggered when the converter has finished converting a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static readonly EVENT_END = ConverterEvents.END;

    /**
     * Factory events
     */

    /**
     * Triggered when the converter has created a declaration reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static readonly EVENT_CREATE_DECLARATION =
        ConverterEvents.CREATE_DECLARATION;

    /**
     * Triggered when the converter has created a signature reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static readonly EVENT_CREATE_SIGNATURE = ConverterEvents.CREATE_SIGNATURE;

    /**
     * Triggered when the converter has created a parameter reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static readonly EVENT_CREATE_PARAMETER = ConverterEvents.CREATE_PARAMETER;

    /**
     * Triggered when the converter has created a type parameter reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static readonly EVENT_CREATE_TYPE_PARAMETER =
        ConverterEvents.CREATE_TYPE_PARAMETER;

    /**
     * Resolve events
     */

    /**
     * Triggered when the converter begins resolving a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static readonly EVENT_RESOLVE_BEGIN = ConverterEvents.RESOLVE_BEGIN;

    /**
     * Triggered when the converter resolves a reflection.
     * The listener should implement [[IConverterResolveCallback]].
     * @event
     */
    static readonly EVENT_RESOLVE = ConverterEvents.RESOLVE;

    /**
     * Triggered when the converter has finished resolving a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static readonly EVENT_RESOLVE_END = ConverterEvents.RESOLVE_END;

    /**
     * Compile the given source files and create a project reflection for them.
     *
     * @param entryPoints the entry points of this program.
     * @param program the program to document that has already been type checked.
     */
    convert(
        entryPoints: readonly string[],
        program: ts.Program
    ): ProjectReflection | undefined {
        this.externalPatternCache = void 0;

        const checker = program.getTypeChecker();
        const context = new Context(this, checker, program);

        this.trigger(Converter.EVENT_BEGIN, context);

        this.compile(program, entryPoints, context);
        const project = this.resolve(context);
        // This should only do anything if a plugin does something bad.
        project.removeDanglingReferences();

        this.trigger(Converter.EVENT_END, context);

        return project;
    }

    /**
     * Convert the given TypeScript type into its TypeDoc type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param referenceTarget The target to be used to attempt to resolve reference types
     * @returns The TypeDoc type reflection representing the given node and type.
     */
    convertType(
        context: Context,
        node: ts.TypeNode | ts.Type | undefined,
        referenceTarget: ts.Node | undefined
    ): Type {
        return convertType(context, node, referenceTarget);
    }

    getNodesForSymbol(symbol: ts.Symbol, kind: ReflectionKind) {
        const wantedKinds: ts.SyntaxKind[] = {
            [ReflectionKind.Project]: [ts.SyntaxKind.SourceFile],
            [ReflectionKind.Module]: [ts.SyntaxKind.SourceFile],
            [ReflectionKind.Namespace]: [
                ts.SyntaxKind.ModuleDeclaration,
                ts.SyntaxKind.SourceFile,
            ],
            [ReflectionKind.Enum]: [ts.SyntaxKind.EnumDeclaration],
            [ReflectionKind.EnumMember]: [ts.SyntaxKind.EnumMember],
            [ReflectionKind.Variable]: [ts.SyntaxKind.VariableDeclaration],
            [ReflectionKind.Function]: [
                ts.SyntaxKind.FunctionDeclaration,
                ts.SyntaxKind.VariableDeclaration,
            ],
            [ReflectionKind.Class]: [ts.SyntaxKind.ClassDeclaration],
            [ReflectionKind.Interface]: [ts.SyntaxKind.InterfaceDeclaration],
            [ReflectionKind.Constructor]: [ts.SyntaxKind.Constructor],
            [ReflectionKind.Property]: [
                ts.SyntaxKind.PropertyDeclaration,
                ts.SyntaxKind.PropertySignature,
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
            [ReflectionKind.TypeAlias]: [ts.SyntaxKind.TypeAliasDeclaration],
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
        program: ts.Program,
        entryPoints: readonly string[],
        context: Context
    ) {
        const baseDir = getCommonDirectory(entryPoints);
        const needsSecondPass: ts.SourceFile[] = [];

        for (const entry of entryPoints) {
            const sourceFile = program.getSourceFile(normalizePath(entry));
            if (!sourceFile) {
                this.application.logger.warn(
                    `Unable to locate entry point: ${entry}`
                );
                continue;
            }

            needsSecondPass.push(sourceFile);
            this.convertExports(context, sourceFile, entryPoints, baseDir);
        }

        for (const file of needsSecondPass) {
            this.convertReExports(context, file);
        }
    }

    private convertExports(
        context: Context,
        node: ts.SourceFile,
        entryPoints: readonly string[],
        baseDir: string
    ) {
        const symbol = context.checker.getSymbolAtLocation(node) ?? node.symbol;
        let moduleContext: Context;

        if (entryPoints.length === 1) {
            // Special case for when we're giving a single entry point, we don't need to
            // create modules for each entry. Register the project as this module.
            context.project.registerReflection(context.project, symbol);
            moduleContext = context;
        } else if (symbol) {
            const reflection = context.createDeclarationReflection(
                ReflectionKind.Module,
                symbol,
                getModuleName(node.fileName, baseDir)
            );
            moduleContext = context.withScope(reflection);
        } else {
            this.application.logger.warn(
                `If specifying a global file as an entry point, only one entry point may be specified. (${node.fileName})`
            );
            return;
        }

        for (const exp of getExports(context, node).filter((exp) =>
            context
                .resolveAliasedSymbol(exp)
                .getDeclarations()
                ?.every((d) => d.getSourceFile() === node.getSourceFile())
        )) {
            convertSymbol(moduleContext, exp);
        }
    }

    private convertReExports(context: Context, node: ts.SourceFile) {
        const symbol = context.checker.getSymbolAtLocation(node) ?? node.symbol;
        // Was a global "module"... no re exports.
        if (symbol == null) return;

        const moduleReflection = context.project.getReflectionFromSymbol(
            symbol
        );
        assert(
            moduleReflection instanceof ContainerReflection ||
                moduleReflection instanceof DeclarationReflection
        );

        const moduleContext = context.withScope(moduleReflection);
        for (const exp of getExports(context, node).filter((exp) =>
            context
                .resolveAliasedSymbol(exp)
                .getDeclarations()
                ?.some((d) => d.getSourceFile() !== node.getSourceFile())
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
    private resolve(context: Context): ProjectReflection {
        this.trigger(Converter.EVENT_RESOLVE_BEGIN, context);
        const project = context.project;

        for (const reflection of Object.values(project.reflections)) {
            this.trigger(Converter.EVENT_RESOLVE, context, reflection);
        }

        this.trigger(Converter.EVENT_RESOLVE_END, context);
        return project;
    }

    /** @internal */
    shouldIgnore(symbol: ts.Symbol, checker: ts.TypeChecker) {
        if (
            this.excludeNotDocumented &&
            // If the enum is included, we should include members even if not documented.
            !hasFlag(symbol.flags, ts.SymbolFlags.EnumMember) &&
            !symbol.getDocumentationComment(checker)
        ) {
            return true;
        }

        if (!this.excludeExternals) {
            return false;
        }

        return this.isExternal(symbol);
    }

    /** @internal */
    isExternal(symbol: ts.Symbol) {
        this.externalPatternCache ??= createMinimatch(this.externalPattern);
        for (const node of symbol.getDeclarations() ?? []) {
            if (
                this.externalPatternCache.some((p) =>
                    p.match(node.getSourceFile().fileName)
                )
            ) {
                return true;
            }
        }

        return false;
    }
}

function getModuleName(fileName: string, baseDir: string) {
    return normalizePath(relative(baseDir, fileName)).replace(
        /(\.d)?\.[tj]sx?$/,
        ""
    );
}

function getExports(
    context: Context,
    node: ts.SourceFile | ts.ModuleBlock
): ts.Symbol[] {
    let symbol = context.checker.getSymbolAtLocation(node) ?? node.symbol;
    if (!symbol && ts.isModuleBlock(node)) {
        symbol = context.checker.getSymbolAtLocation(node.parent.name);
    }

    // The generated docs aren't great, but you really ought not be using
    // this in the first place... so it's better than nothing.
    const exportEq = symbol?.exports?.get("export=" as ts.__String);
    if (exportEq) {
        return [exportEq];
    }

    if (symbol) {
        return context.checker.getExportsOfModule(symbol);
    }

    // This is a global file, get all symbols declared in this file...
    // this isn't the best solution, it would be nice to have all globals given to a special
    // "globals" file, but this is uncommon enough that I'm skipping it for now.
    const sourceFile = node.getSourceFile();
    return context.checker
        .getSymbolsInScope(node, ts.SymbolFlags.ModuleMember)
        .filter((s) =>
            s.getDeclarations()?.some((d) => d.getSourceFile() === sourceFile)
        );
}
