import * as ts from "typescript";

import type { Application } from "../application";
import {
    Comment,
    CommentDisplayPart,
    ProjectReflection,
    Reflection,
    ReflectionKind,
    SomeType,
} from "../models/index";
import { Context } from "./context";
import { ConverterComponent } from "./components";
import { Component, ChildableComponent } from "../utils/component";
import { BindOption, MinimalSourceFile, readFile } from "../utils";
import { convertType } from "./types";
import { ConverterEvents } from "./converter-events";
import { convertSymbol } from "./symbols";
import { createMinimatch, matchesAny } from "../utils/paths";
import type { Minimatch } from "minimatch";
import { hasAllFlags, hasAnyFlag } from "../utils/enum";
import type { DocumentationEntryPoint } from "../utils/entry-point";
import { CommentParserConfig, getComment } from "./comments";
import type {
    CommentStyle,
    ValidationOptions,
} from "../utils/options/declaration";
import { parseComment } from "./comments/parser";
import { lexCommentString } from "./comments/rawLexer";
import {
    resolvePartLinks,
    resolveLinks,
    ExternalSymbolResolver,
    ExternalResolveResult,
} from "./comments/linkResolver";
import type { DeclarationReference } from "./comments/declarationReference";

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
    /** @internal */
    @BindOption("externalPattern")
    externalPattern!: string[];
    private externalPatternCache?: Minimatch[];
    private excludeCache?: Minimatch[];

    /** @internal */
    @BindOption("excludeExternals")
    excludeExternals!: boolean;

    /** @internal */
    @BindOption("excludeNotDocumented")
    excludeNotDocumented!: boolean;

    /** @internal */
    @BindOption("excludePrivate")
    excludePrivate!: boolean;

    /** @internal */
    @BindOption("excludeProtected")
    excludeProtected!: boolean;

    /** @internal */
    @BindOption("commentStyle")
    commentStyle!: CommentStyle;

    /** @internal */
    @BindOption("validation")
    validation!: ValidationOptions;

    /** @internal */
    @BindOption("externalSymbolLinkMappings")
    externalSymbolLinkMappings!: Record<string, Record<string, string>>;

    private _config?: CommentParserConfig;
    private _externalSymbolResolvers: Array<ExternalSymbolResolver> = [];

    get config(): CommentParserConfig {
        return this._config || this._buildCommentParserConfig();
    }

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
     * The listener will be given {@link Context}, {@link SignatureReflection} | {@link ProjectReflection} the declaration,
     * `ts.SignatureDeclaration | ts.IndexSignatureDeclaration | ts.JSDocSignature | undefined`,
     * and `ts.Signature | undefined`. The signature will be undefined if the created signature is an index signature.
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

    constructor(owner: Application) {
        super(owner);

        this.addUnknownSymbolResolver((ref) => {
            // Require global links, matching local ones will likely hide mistakes where the
            // user meant to link to a local type.
            if (ref.resolutionStart !== "global" || !ref.symbolReference) {
                return;
            }

            const modLinks =
                this.externalSymbolLinkMappings[ref.moduleSource ?? "global"];
            if (typeof modLinks !== "object") {
                return;
            }

            let name = "";
            if (ref.symbolReference.path) {
                name += ref.symbolReference.path.map((p) => p.path).join(".");
            }
            if (ref.symbolReference.meaning) {
                name += ":" + ref.symbolReference.meaning;
            }

            if (typeof modLinks[name] === "string") {
                return modLinks[name];
            }
            if (typeof modLinks["*"] === "string") {
                return modLinks["*"];
            }
        });
    }

    /**
     * Compile the given source files and create a project reflection for them.
     */
    convert(
        entryPoints: readonly DocumentationEntryPoint[]
    ): ProjectReflection {
        const programs = entryPoints.map((e) => e.program);
        this.externalPatternCache = void 0;

        const project = new ProjectReflection(
            this.application.options.getValue("name")
        );
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
    convertSymbol(
        context: Context,
        symbol: ts.Symbol,
        exportSymbol?: ts.Symbol
    ) {
        convertSymbol(context, symbol, exportSymbol);
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

    /**
     * Parse the given file into a comment. Intended to be used with markdown files.
     */
    parseRawComment(file: MinimalSourceFile) {
        return parseComment(
            lexCommentString(file.text),
            this.config,
            file,
            this.application.logger
        );
    }

    /**
     * Adds a new resolver that the theme can use to try to figure out how to link to a symbol declared
     * by a third-party library which is not included in the documentation.
     *
     * The resolver function will be passed a declaration reference which it can attempt to resolve. If
     * resolution fails, the function should return undefined.
     *
     * Note: This will be used for both references to types declared in node_modules (in which case the
     * reference passed will have the `moduleSource` set and the `symbolReference` will navigate via `.`)
     * and user defined \{\@link\} tags which cannot be resolved.
     * @since 0.22.14
     */
    addUnknownSymbolResolver(resolver: ExternalSymbolResolver): void {
        this._externalSymbolResolvers.push(resolver);
    }

    /** @internal */
    resolveExternalLink(
        ref: DeclarationReference,
        part?: CommentDisplayPart,
        refl?: Reflection
    ): ExternalResolveResult | string | undefined {
        for (const resolver of this._externalSymbolResolvers) {
            const resolved = resolver(ref, part, refl);
            if (resolved) return resolved;
        }
    }

    resolveLinks(comment: Comment, owner: Reflection): void;
    resolveLinks(
        parts: readonly CommentDisplayPart[],
        owner: Reflection
    ): CommentDisplayPart[];
    resolveLinks(
        comment: Comment | readonly CommentDisplayPart[],
        owner: Reflection
    ): CommentDisplayPart[] | undefined {
        if (comment instanceof Comment) {
            resolveLinks(
                comment,
                owner,
                this.validation,
                this.owner.logger,
                (ref, part, refl) => this.resolveExternalLink(ref, part, refl)
            );
        } else {
            let warned = false;
            const warn = () => {
                if (!warned) {
                    warned = true;
                    this.application.logger.warn(
                        `${owner.name}: Comment [[target]] style links are deprecated and will be removed in 0.24`
                    );
                }
            };

            return resolvePartLinks(
                owner,
                comment,
                warn,
                this.validation,
                this.owner.logger,
                (ref, part, refl) => this.resolveExternalLink(ref, part, refl)
            );
        }
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
                e.entryPoint,
                entries.length === 1
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
        entryPoint: DocumentationEntryPoint,
        singleEntryPoint: boolean
    ) {
        const node = entryPoint.sourceFile;
        const entryName = entryPoint.displayName;
        const symbol = getSymbolForModuleLike(context, node);
        let moduleContext: Context;

        if (singleEntryPoint) {
            // Special case for when we're giving a single entry point, we don't need to
            // create modules for each entry. Register the project as this module.
            context.project.registerReflection(context.project, symbol);
            context.project.comment =
                symbol &&
                getComment(
                    symbol,
                    context.project.kind,
                    this.config,
                    this.application.logger,
                    this.commentStyle
                );
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

            if (entryPoint.readmeFile) {
                const readme = readFile(entryPoint.readmeFile);
                const comment = this.parseRawComment(
                    new MinimalSourceFile(readme, entryPoint.readmeFile)
                );

                if (comment.blockTags.length || comment.modifierTags.size) {
                    const ignored = [
                        ...comment.blockTags.map((tag) => tag.tag),
                        ...comment.modifierTags,
                    ];
                    context.logger.warn(
                        `Block and modifier tags will be ignored within the readme:\n\t${ignored.join(
                            "\n\t"
                        )}`
                    );
                }

                reflection.readme = comment.summary;
            }

            reflection.version = entryPoint.version;

            context.finalizeDeclarationReflection(reflection);
            moduleContext = context.withScope(reflection);
        }

        const allExports = getExports(context, node, symbol);
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

    /**
     * Used to determine if we should immediately bail when creating a reflection.
     * Note: This should not be used for excludeNotDocumented because we don't have enough
     * information at this point since comment discovery hasn't happened.
     * @internal
     */
    shouldIgnore(symbol: ts.Symbol) {
        if (this.isExcluded(symbol)) {
            return true;
        }

        return this.excludeExternals && this.isExternal(symbol);
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

    private _buildCommentParserConfig() {
        this._config = {
            blockTags: new Set(this.application.options.getValue("blockTags")),
            inlineTags: new Set(
                this.application.options.getValue("inlineTags")
            ),
            modifierTags: new Set(
                this.application.options.getValue("modifierTags")
            ),
        };
        return this._config;
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
    node: ts.SourceFile,
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

        if (result.length === 0) {
            const globalDecl = node.statements.find(
                (s) =>
                    ts.isModuleDeclaration(s) &&
                    s.flags & ts.NodeFlags.GlobalAugmentation
            );

            if (globalDecl) {
                const globalSymbol = context.getSymbolAtLocation(globalDecl);
                if (globalSymbol) {
                    result = context.checker
                        .getExportsOfModule(globalSymbol)
                        .filter((exp) =>
                            exp.declarations?.some(
                                (d) => d.getSourceFile() === node
                            )
                        );
                }
            }
        }
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
