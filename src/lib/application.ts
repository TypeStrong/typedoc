import * as Path from "path";
import ts from "typescript";

import { Converter } from "./converter/index";
import { Renderer } from "./output/renderer";
import { Deserializer, type JSONOutput, Serializer } from "./serialization";
import type { ProjectReflection } from "./models/index";
import {
    Logger,
    ConsoleLogger,
    loadPlugins,
    writeFile,
    type OptionsReader,
    TSConfigReader,
    TypeDocReader,
    PackageJsonReader,
} from "./utils/index";

import {
    type AbstractComponent,
    ChildableComponent,
    Component,
} from "./utils/component";
import { Options, Option } from "./utils";
import type { TypeDocOptions } from "./utils/options/declaration";
import { unique } from "./utils/array";
import { ok } from "assert";
import {
    type DocumentationEntryPoint,
    EntryPointStrategy,
    getEntryPoints,
    getPackageDirectories,
    getWatchEntryPoints,
} from "./utils/entry-point";
import { nicePath } from "./utils/paths";
import { getLoadedPaths, hasBeenLoadedMultipleTimes } from "./utils/general";
import { validateExports } from "./validation/exports";
import { validateDocumentation } from "./validation/documentation";
import { validateLinks } from "./validation/links";
import { ApplicationEvents } from "./application-events";
import { findTsConfigFile } from "./utils/tsconfig";
import { deriveRootDir, glob, readFile } from "./utils/fs";
import { resetReflectionID } from "./models/reflections/abstract";
import { addInferredDeclarationMapPaths } from "./models/reflections/ReflectionSymbolId";
import {
    Internationalization,
    type TranslatedString,
} from "./internationalization/internationalization";
import { loadShikiMetadata } from "./utils/highlighter";
import { ValidatingFileRegistry, FileRegistry } from "./models/FileRegistry";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo = require("../../package.json") as {
    version: string;
    peerDependencies: { typescript: string };
};

const supportedVersionMajorMinor = packageInfo.peerDependencies.typescript
    .split("||")
    .map((version) => version.replace(/^\s*|\.x\s*$/g, ""));

const DETECTOR = Symbol();

export function createAppForTesting(): Application {
    // @ts-expect-error private constructor
    const app: Application = new Application(DETECTOR);
    app.files = new FileRegistry();
    return app;
}

const DEFAULT_READERS = [
    new TypeDocReader(),
    new PackageJsonReader(),
    new TSConfigReader(),
];

export interface ApplicationEvents {
    bootstrapEnd: [Application];
    reviveProject: [ProjectReflection];
    validateProject: [ProjectReflection];
}

/**
 * The default TypeDoc main application class.
 *
 * This class holds the two main components of TypeDoc, the {@link Converter} and
 * the {@link Renderer}. When running TypeDoc, first the {@link Converter} is invoked which
 * generates a {@link ProjectReflection} from the passed in source files. The
 * {@link ProjectReflection} is a hierarchical model representation of the TypeScript
 * project. Afterwards the model is passed to the {@link Renderer} which uses an instance
 * of {@link Theme} to generate the final documentation.
 *
 * Both the {@link Converter} and the {@link Renderer} emit a series of events while processing the project.
 * Subscribe to these Events to control the application flow or alter the output.
 *
 * @remarks
 *
 * Access to an Application instance can be retrieved with {@link Application.bootstrap} or
 * {@link Application.bootstrapWithPlugins}. It can not be constructed manually.
 */
@Component({ name: "application", internal: true })
export class Application extends ChildableComponent<
    Application,
    AbstractComponent<Application, {}>,
    ApplicationEvents
> {
    /**
     * The converter used to create the declaration reflections.
     */
    converter: Converter;

    /**
     * The renderer used to generate the documentation output.
     */
    renderer: Renderer;

    /**
     * The serializer used to generate JSON output.
     */
    serializer = new Serializer();

    /**
     * The deserializer used to restore previously serialized JSON output.
     */
    deserializer = new Deserializer(this);

    /**
     * The logger that should be used to output messages.
     */
    logger: Logger = new ConsoleLogger();

    /**
     * Internationalization module which supports translating according to
     * the `lang` option.
     */
    internationalization = new Internationalization(this);

    /**
     * Proxy based shortcuts for internationalization keys.
     */
    i18n = this.internationalization.proxy;

    options = new Options(this.i18n);

    files: FileRegistry = new ValidatingFileRegistry();

    /** @internal */
    @Option("lang")
    accessor lang!: string;

    /** @internal */
    @Option("skipErrorChecking")
    accessor skipErrorChecking!: boolean;

    /** @internal */
    @Option("entryPointStrategy")
    accessor entryPointStrategy!: EntryPointStrategy;

    /** @internal */
    @Option("entryPoints")
    accessor entryPoints!: string[];

    /**
     * The version number of TypeDoc.
     */
    static readonly VERSION = packageInfo.version;

    /**
     * Emitted after plugins have been loaded and options have been read, but before they have been frozen.
     * The listener will be given an instance of {@link Application}.
     */
    static readonly EVENT_BOOTSTRAP_END = ApplicationEvents.BOOTSTRAP_END;

    /**
     * Emitted after a project has been deserialized from JSON.
     * The listener will be given an instance of {@link ProjectReflection}.
     */
    static readonly EVENT_PROJECT_REVIVE = ApplicationEvents.REVIVE;

    /**
     * Emitted when validation is being run.
     * The listener will be given an instance of {@link ProjectReflection}.
     */
    static readonly EVENT_VALIDATE_PROJECT = ApplicationEvents.VALIDATE_PROJECT;

    /**
     * Create a new TypeDoc application instance.
     */
    private constructor(detector: typeof DETECTOR) {
        if (detector !== DETECTOR) {
            throw new Error(
                "An application handle must be retrieved with Application.bootstrap or Application.bootstrapWithPlugins",
            );
        }
        super(null!); // We own ourselves

        this.converter = new Converter(this);
        this.renderer = new Renderer(this);
        this.logger.i18n = this.i18n;
    }

    /**
     * Initialize TypeDoc, loading plugins if applicable.
     */
    static async bootstrapWithPlugins(
        options: Partial<TypeDocOptions> = {},
        readers: readonly OptionsReader[] = DEFAULT_READERS,
    ): Promise<Application> {
        await loadShikiMetadata();
        const app = new Application(DETECTOR);
        readers.forEach((r) => app.options.addReader(r));
        app.options.reset();
        app.setOptions(options, /* reportErrors */ false);
        await app.options.read(new Logger());
        app.logger.level = app.options.getValue("logLevel");

        await loadPlugins(app, app.options.getValue("plugin"));

        await app._bootstrap(options);
        return app;
    }

    /**
     * Initialize TypeDoc without loading plugins.
     *
     * @example
     * Initialize the application with pretty-printing output disabled.
     * ```ts
     * const app = Application.bootstrap({ pretty: false });
     * ```
     *
     * @param options Options to set during initialization
     * @param readers Option readers to use to discover options from config files.
     */
    static async bootstrap(
        options: Partial<TypeDocOptions> = {},
        readers: readonly OptionsReader[] = DEFAULT_READERS,
    ): Promise<Application> {
        await loadShikiMetadata();
        const app = new Application(DETECTOR);
        readers.forEach((r) => app.options.addReader(r));
        await app._bootstrap(options);
        return app;
    }

    private async _bootstrap(options: Partial<TypeDocOptions>) {
        this.options.reset();
        this.setOptions(options, /* reportErrors */ false);
        await this.options.read(this.logger);
        this.setOptions(options);
        this.logger.level = this.options.getValue("logLevel");
        for (const [lang, locales] of Object.entries(
            this.options.getValue("locales"),
        )) {
            this.internationalization.addTranslations(lang, locales);
        }

        if (hasBeenLoadedMultipleTimes()) {
            this.logger.warn(
                this.i18n.loaded_multiple_times_0(
                    getLoadedPaths().join("\n\t"),
                ),
            );
        }
        this.trigger(ApplicationEvents.BOOTSTRAP_END, this);

        if (!this.internationalization.hasTranslations(this.lang)) {
            // Not internationalized as by definition we don't know what to include here.
            this.logger.warn(
                `Options specified "${this.lang}" as the language to use, but TypeDoc does not support it.` as TranslatedString,
            );
            this.logger.info(
                ("The supported languages are:\n\t" +
                    this.internationalization
                        .getSupportedLanguages()
                        .join("\n\t")) as TranslatedString,
            );
            this.logger.info(
                "You can define/override local locales with the `locales` option, or contribute them to TypeDoc!" as TranslatedString,
            );
        }

        if (
            this.options.getValue("useHostedBaseUrlForAbsoluteLinks") &&
            !this.options.getValue("hostedBaseUrl")
        ) {
            this.logger.warn(
                this.i18n.useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl(),
            );
            this.options.setValue("useHostedBaseUrlForAbsoluteLinks", false);
        }
    }

    private setOptions(options: Partial<TypeDocOptions>, reportErrors = true) {
        for (const [key, val] of Object.entries(options)) {
            try {
                this.options.setValue(key as never, val as never);
            } catch (error) {
                ok(error instanceof Error);
                if (reportErrors) {
                    this.logger.error(error.message as TranslatedString);
                }
            }
        }
    }

    /**
     * Return the path to the TypeScript compiler.
     */
    public getTypeScriptPath(): string {
        return nicePath(Path.dirname(require.resolve("typescript")));
    }

    public getTypeScriptVersion(): string {
        return ts.version;
    }

    /**
     * Gets the entry points to be documented according to the current `entryPoints` and `entryPointStrategy` options.
     * May return undefined if entry points fail to be expanded.
     */
    public getEntryPoints(): DocumentationEntryPoint[] | undefined {
        return getEntryPoints(this.logger, this.options);
    }

    /**
     * Run the converter for the given set of files and return the generated reflections.
     *
     * @returns An instance of ProjectReflection on success, undefined otherwise.
     */
    public async convert(): Promise<ProjectReflection | undefined> {
        const start = Date.now();
        // We freeze here rather than in the Converter class since TypeDoc's tests reuse the Application
        // with a few different settings.
        this.options.freeze();
        this.logger.verbose(
            `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`,
        );

        if (this.entryPointStrategy === EntryPointStrategy.Merge) {
            return this._merge();
        }

        if (this.entryPointStrategy === EntryPointStrategy.Packages) {
            return this._convertPackages();
        }

        if (
            !supportedVersionMajorMinor.some(
                (version) => version == ts.versionMajorMinor,
            )
        ) {
            this.logger.warn(
                this.i18n.unsupported_ts_version_0(
                    supportedVersionMajorMinor.join(", "),
                ),
            );
        }

        const entryPoints = this.getEntryPoints();

        if (!entryPoints) {
            // Fatal error already reported.
            return;
        }

        const programs = unique(entryPoints.map((e) => e.program));
        this.logger.verbose(
            `Converting with ${programs.length} programs ${entryPoints.length} entry points`,
        );

        if (this.skipErrorChecking === false) {
            const errors = programs.flatMap((program) =>
                ts.getPreEmitDiagnostics(program),
            );
            if (errors.length) {
                this.logger.diagnostics(errors);
                return;
            }
        }

        if (this.options.getValue("emit") === "both") {
            for (const program of programs) {
                program.emit();
            }
        }

        const startConversion = Date.now();
        this.logger.verbose(
            `Finished getting entry points in ${Date.now() - start}ms`,
        );

        const project = this.converter.convert(entryPoints);
        this.logger.verbose(
            `Finished conversion in ${Date.now() - startConversion}ms`,
        );
        return project;
    }

    public convertAndWatch(
        success: (project: ProjectReflection) => Promise<void>,
    ): void {
        this.options.freeze();
        if (
            !this.options.getValue("preserveWatchOutput") &&
            this.logger instanceof ConsoleLogger
        ) {
            ts.sys.clearScreen?.();
        }

        this.logger.verbose(
            `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`,
        );

        if (
            !supportedVersionMajorMinor.some(
                (version) => version == ts.versionMajorMinor,
            )
        ) {
            this.logger.warn(
                this.i18n.unsupported_ts_version_0(
                    supportedVersionMajorMinor.join(", "),
                ),
            );
        }

        if (Object.keys(this.options.getCompilerOptions()).length === 0) {
            this.logger.warn(this.i18n.no_compiler_options_set());
        }

        // Doing this is considerably more complicated, we'd need to manage an array of programs, not convert until all programs
        // have reported in the first time... just error out for now. I'm not convinced anyone will actually notice.
        if (this.options.getFileNames().length === 0) {
            this.logger.error(this.i18n.solution_not_supported_in_watch_mode());
            return;
        }

        // Support for packages mode is currently unimplemented
        if (
            this.entryPointStrategy !== EntryPointStrategy.Resolve &&
            this.entryPointStrategy !== EntryPointStrategy.Expand
        ) {
            this.logger.error(this.i18n.strategy_not_supported_in_watch_mode());
            return;
        }

        const tsconfigFile =
            findTsConfigFile(this.options.getValue("tsconfig")) ??
            "tsconfig.json";

        // We don't want to do it the first time to preserve initial debug status messages. They'll be lost
        // after the user saves a file, but better than nothing...
        let firstStatusReport = true;

        const host = ts.createWatchCompilerHost(
            tsconfigFile,
            {},
            ts.sys,
            ts.createEmitAndSemanticDiagnosticsBuilderProgram,
            (diagnostic) => this.logger.diagnostic(diagnostic),
            (status, newLine, _options, errorCount) => {
                if (
                    !firstStatusReport &&
                    errorCount === void 0 &&
                    !this.options.getValue("preserveWatchOutput") &&
                    this.logger instanceof ConsoleLogger
                ) {
                    ts.sys.clearScreen?.();
                }
                firstStatusReport = false;
                this.logger.info(
                    ts.flattenDiagnosticMessageText(
                        status.messageText,
                        newLine,
                    ) as TranslatedString,
                );
            },
        );

        let successFinished = true;
        let currentProgram: ts.Program | undefined;

        const runSuccess = () => {
            if (!currentProgram) {
                return;
            }

            if (successFinished) {
                if (this.options.getValue("emit") === "both") {
                    currentProgram.emit();
                }

                this.logger.resetErrors();
                this.logger.resetWarnings();
                const entryPoints = getWatchEntryPoints(
                    this.logger,
                    this.options,
                    currentProgram,
                );
                if (!entryPoints) {
                    return;
                }
                const project = this.converter.convert(entryPoints);
                currentProgram = undefined;
                successFinished = false;
                void success(project).then(() => {
                    successFinished = true;
                    runSuccess();
                });
            }
        };

        const origCreateProgram = host.createProgram;
        host.createProgram = (
            rootNames,
            options,
            host,
            oldProgram,
            configDiagnostics,
            references,
        ) => {
            // If we always do this, we'll get a crash the second time a program is created.
            if (rootNames !== undefined) {
                options = this.options.fixCompilerOptions(options || {});
            }

            return origCreateProgram(
                rootNames,
                options,
                host,
                oldProgram,
                configDiagnostics,
                references,
            );
        };

        const origAfterProgramCreate = host.afterProgramCreate;
        host.afterProgramCreate = (program) => {
            if (ts.getPreEmitDiagnostics(program.getProgram()).length === 0) {
                currentProgram = program.getProgram();
                runSuccess();
            }
            origAfterProgramCreate?.(program);
        };

        ts.createWatchProgram(host);
    }

    validate(project: ProjectReflection) {
        const checks = this.options.getValue("validation");
        const start = Date.now();

        // No point in validating exports when merging. Warnings will have already been emitted when
        // creating the project jsons that this run merges together.
        if (
            checks.notExported &&
            this.entryPointStrategy !== EntryPointStrategy.Merge
        ) {
            validateExports(
                project,
                this.logger,
                this.options.getValue("intentionallyNotExported"),
            );
        }

        if (checks.notDocumented) {
            validateDocumentation(
                project,
                this.logger,
                this.options.getValue("requiredToBeDocumented"),
            );
        }

        if (checks.invalidLink) {
            validateLinks(project, this.logger);
        }

        this.trigger(Application.EVENT_VALIDATE_PROJECT, project);

        this.logger.verbose(`Validation took ${Date.now() - start}ms`);
    }

    /**
     * Render HTML for the given project
     */
    public async generateDocs(
        project: ProjectReflection,
        out: string,
    ): Promise<void> {
        const start = Date.now();
        out = Path.resolve(out);
        await this.renderer.render(project, out);

        if (this.logger.hasErrors()) {
            this.logger.error(this.i18n.docs_could_not_be_generated());
        } else {
            this.logger.info(this.i18n.docs_generated_at_0(nicePath(out)));
            this.logger.verbose(`HTML rendering took ${Date.now() - start}ms`);
        }
    }

    /**
     * Write the reflections to a json file.
     *
     * @param out The path and file name of the target file.
     * @returns Whether the JSON file could be written successfully.
     */
    public async generateJson(
        project: ProjectReflection,
        out: string,
    ): Promise<void> {
        const start = Date.now();
        out = Path.resolve(out);
        const ser = this.serializer.projectToObject(project, process.cwd());

        const space = this.options.getValue("pretty") ? "\t" : "";
        await writeFile(out, JSON.stringify(ser, null, space));
        this.logger.info(this.i18n.json_written_to_0(nicePath(out)));
        this.logger.verbose(`JSON rendering took ${Date.now() - start}ms`);
    }

    /**
     * Print the version number.
     */
    override toString() {
        return [
            "",
            `TypeDoc ${Application.VERSION}`,
            `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`,
            "",
        ].join("\n");
    }

    private async _convertPackages(): Promise<ProjectReflection | undefined> {
        if (!this.options.isSet("entryPoints")) {
            this.logger.error(this.i18n.no_entry_points_for_packages());
            return;
        }

        const packageDirs = getPackageDirectories(
            this.logger,
            this.options,
            this.options.getValue("entryPoints"),
        );

        if (packageDirs.length === 0) {
            this.logger.error(this.i18n.failed_to_find_packages());
            return;
        }

        const origFiles = this.files;
        const origOptions = this.options;
        const projects: JSONOutput.ProjectReflection[] = [];

        const projectsToConvert: { dir: string; options: Options }[] = [];
        // Generate a json file for each package
        for (const dir of packageDirs) {
            this.logger.verbose(`Reading project at ${nicePath(dir)}`);
            let opts: Options;
            try {
                opts = origOptions.copyForPackage(dir);
            } catch (error) {
                ok(error instanceof Error);
                this.logger.error(error.message as TranslatedString);
                this.logger.info(
                    this.i18n.previous_error_occurred_when_reading_options_for_0(
                        nicePath(dir),
                    ),
                );
                continue;
            }

            await opts.read(this.logger, dir);
            // Invalid links should only be reported after everything has been merged.
            opts.setValue("validation", { invalidLink: false });
            if (
                opts.getValue("entryPointStrategy") ===
                EntryPointStrategy.Packages
            ) {
                this.logger.error(
                    this.i18n.nested_packages_unsupported_0(nicePath(dir)),
                );
                continue;
            }

            addInferredDeclarationMapPaths(
                opts.getCompilerOptions(),
                opts.getFileNames(),
            );

            projectsToConvert.push({ dir, options: opts });
        }

        for (const { dir, options } of projectsToConvert) {
            this.logger.info(this.i18n.converting_project_at_0(nicePath(dir)));
            this.options = options;
            this.files = new ValidatingFileRegistry();
            let project = await this.convert();
            if (project) {
                this.validate(project);
                const serialized = this.serializer.projectToObject(
                    project,
                    process.cwd(),
                );
                projects.push(serialized);
            }

            // When debugging memory issues, it's useful to set these
            // here so that a breakpoint on resetReflectionID below
            // gets the memory as it ought to be with all TS objects released.
            project = undefined;
            this.files = undefined!;
            // global.gc!();

            resetReflectionID();
        }

        this.options = origOptions;
        this.files = origFiles;

        if (projects.length !== packageDirs.length) {
            this.logger.error(this.i18n.failed_to_convert_packages());
            return;
        }

        this.logger.info(this.i18n.merging_converted_projects());
        const result = this.deserializer.reviveProjects(
            this.options.getValue("name") || "Documentation",
            projects,
            process.cwd(),
            this.files,
        );
        this.trigger(ApplicationEvents.REVIVE, result);
        return result;
    }

    private _merge(): ProjectReflection | undefined {
        const start = Date.now();

        if (!this.options.isSet("entryPoints")) {
            this.logger.error(this.i18n.no_entry_points_to_merge());
            return;
        }

        const rootDir = deriveRootDir(this.entryPoints);
        const entryPoints = this.entryPoints.flatMap((entry) => {
            const result = glob(entry, rootDir);

            if (result.length === 0) {
                this.logger.warn(
                    this.i18n.entrypoint_did_not_match_files_0(nicePath(entry)),
                );
            } else {
                this.logger.verbose(
                    `Expanded ${nicePath(entry)} to:\n\t${result
                        .map(nicePath)
                        .join("\n\t")}`,
                );
            }

            return result;
        });

        const jsonProjects = entryPoints.map((path) => {
            try {
                return JSON.parse(readFile(path));
            } catch {
                this.logger.error(
                    this.i18n.failed_to_parse_json_0(nicePath(path)),
                );
                return null;
            }
        });
        if (this.logger.hasErrors()) return;

        const result = this.deserializer.reviveProjects(
            this.options.getValue("name"),
            jsonProjects,
            process.cwd(),
            this.files,
        );
        this.logger.verbose(`Reviving projects took ${Date.now() - start}ms`);

        // If we only revived one project, the project documents were set for
        // it when it was created. If we revived more than one project then
        // it's convenient to be able to add more documents now.
        if (jsonProjects.length > 1) {
            this.converter.addProjectDocuments(result);
        }

        this.trigger(ApplicationEvents.REVIVE, result);
        return result;
    }
}
