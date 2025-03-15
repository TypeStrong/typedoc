import * as Path from "path";
import ts from "typescript";

import { Deserializer, type JSONOutput, Serializer } from "./serialization/index.js";
import { Converter } from "./converter/index.js";
import { Renderer } from "./output/renderer.js";
import { type ProjectReflection, ReflectionSymbolId } from "./models/index.js";
import {
    AbstractComponent,
    FancyConsoleLogger,
    loadPlugins,
    type OptionsReader,
    PackageJsonReader,
    TSConfigReader,
    TypeDocReader,
    writeFile,
} from "./utils/index.js";

import { Option, Options } from "./utils/index.js";
import { rootPackageOptions, type TypeDocOptions } from "./utils/options/declaration.js";
import { type GlobString, i18n, Logger, LogLevel, type TranslatedString, unique } from "#utils";
import { ok } from "assert";
import {
    type DocumentationEntryPoint,
    EntryPointStrategy,
    getEntryPoints,
    getPackageDirectories,
    getWatchEntryPoints,
    inferEntryPoints,
} from "./utils/entry-point.js";
import { nicePath, normalizePath } from "./utils/paths.js";
import { getLoadedPaths, hasBeenLoadedMultipleTimes, isDebugging } from "./utils/general.js";
import { validateExports } from "./validation/exports.js";
import { validateDocumentation } from "./validation/documentation.js";
import { validateLinks } from "./validation/links.js";
import { ApplicationEvents } from "./application-events.js";
import { deriveRootDir, findTsConfigFile, glob, readFile } from "#node-utils";
import { FileRegistry } from "./models/FileRegistry.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { Outputs } from "./output/output.js";
import { validateMergeModuleWith } from "./validation/unusedMergeModuleWith.js";
import { diagnostic, diagnostics } from "./utils/loggers.js";
import { ValidatingFileRegistry } from "./utils/ValidatingFileRegistry.js";
import { addInferredDeclarationMapPaths } from "./converter/factories/symbol-id.js";
import { Internationalization } from "./internationalization/internationalization.js";

const packageInfo = JSON.parse(
    readFileSync(
        Path.join(fileURLToPath(import.meta.url), "../../../package.json"),
        "utf8",
    ),
) as {
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
 *
 * @group Common
 * @summary Root level class which contains most useful behavior.
 */
export class Application extends AbstractComponent<
    Application,
    ApplicationEvents
> {
    private _logger: Logger = new FancyConsoleLogger();

    /**
     * The converter used to create the declaration reflections.
     */
    converter: Converter;

    outputs = new Outputs(this);

    /**
     * The renderer used to generate the HTML documentation output.
     */
    renderer: Renderer;

    /**
     * The serializer used to generate JSON output.
     */
    serializer = new Serializer();

    /**
     * The deserializer used to restore previously serialized JSON output.
     */
    deserializer = new Deserializer(this._logger);

    /**
     * The logger that should be used to output messages.
     */
    get logger(): Logger {
        return this._logger;
    }
    set logger(l: Logger) {
        this._logger = l;
        this.deserializer.logger = l;
    }

    /**
     * Internationalization module which supports translating according to
     * the `lang` option.
     */
    internationalization = new Internationalization();

    options = new Options();

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
    accessor entryPoints!: GlobString[];

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

        this.outputs.addOutput("json", async (out, project) => {
            const ser = this.serializer.projectToObject(project, normalizePath(process.cwd()));
            const space = this.options.getValue("pretty") ? "\t" : "";
            await writeFile(out, JSON.stringify(ser, null, space) + "\n");
        });

        this.outputs.addOutput("html", async (out, project) => {
            await this.renderer.render(project, out);
        });
    }

    /**
     * Initialize TypeDoc, loading plugins if applicable.
     */
    static async bootstrapWithPlugins(
        options: Partial<TypeDocOptions> = {},
        readers: readonly OptionsReader[] = DEFAULT_READERS,
    ): Promise<Application> {
        const app = new Application(DETECTOR);
        readers.forEach((r) => app.options.addReader(r));
        app.options.reset();
        app.setOptions(options, /* reportErrors */ false);
        app.internationalization.setLocale(app.lang);
        await app.options.read(new Logger(), undefined, (path) => app.watchConfigFile(path));
        app.internationalization.setLocale(app.lang);
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
        const app = new Application(DETECTOR);
        readers.forEach((r) => app.options.addReader(r));
        await app._bootstrap(options);
        return app;
    }

    private async _bootstrap(options: Partial<TypeDocOptions>) {
        this.options.reset();
        this.setOptions(options, /* reportErrors */ false);
        this.internationalization.setLocale(this.lang);

        await this.options.read(this.logger, undefined, (path) => this.watchConfigFile(path));
        this.setOptions(options);
        this.internationalization.setLocale(this.lang);

        if (isDebugging()) {
            this.logger.level = LogLevel.Verbose;
        } else {
            this.logger.level = this.options.getValue("logLevel");
        }

        for (
            const [lang, locales] of Object.entries(
                this.options.getValue("locales"),
            )
        ) {
            this.internationalization.addTranslations(lang, locales);
        }

        if (hasBeenLoadedMultipleTimes()) {
            this.logger.warn(
                i18n.loaded_multiple_times_0(
                    getLoadedPaths().join("\n\t"),
                ),
            );
        }
        this.trigger(ApplicationEvents.BOOTSTRAP_END, this);

        if (!this.internationalization.hasTranslations(this.lang)) {
            // Not internationalized as by definition we don't know what to include here.
            this.logger.warn(
                `Options specified "${this.lang}" as the language to use, but TypeDoc cannot provide translations for it.` as TranslatedString,
            );
            this.logger.info(
                ("The languages that translations are available for are:\n\t" +
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
                i18n.useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl(),
            );
            this.options.setValue("useHostedBaseUrlForAbsoluteLinks", false);
        }
    }

    /** @internal */
    setOptions(options: Partial<TypeDocOptions>, reportErrors = true) {
        let success = true;
        for (const [key, val] of Object.entries(options)) {
            try {
                this.options.setValue(key as never, val as never);
            } catch (error) {
                success = false;
                ok(error instanceof Error);
                if (reportErrors) {
                    this.logger.error(error.message as TranslatedString);
                }
            }
        }
        return success;
    }

    /**
     * Return the path to the TypeScript compiler.
     */
    public getTypeScriptPath(): string {
        const req = createRequire(import.meta.url);
        return nicePath(Path.dirname(req.resolve("typescript")));
    }

    public getTypeScriptVersion(): string {
        return ts.version;
    }

    public getEntryPoints(): DocumentationEntryPoint[] | undefined {
        if (this.options.isSet("entryPoints")) {
            return this.getDefinedEntryPoints();
        }
        return inferEntryPoints(this.logger, this.options);
    }

    /**
     * Gets the entry points to be documented according to the current `entryPoints` and `entryPointStrategy` options.
     * May return undefined if entry points fail to be expanded.
     */
    public getDefinedEntryPoints(): DocumentationEntryPoint[] | undefined {
        return getEntryPoints(this.logger, this.options);
    }

    /**
     * Run the converter for the given set of files and return the generated reflections.
     *
     * @returns An instance of ProjectReflection on success, undefined otherwise.
     */
    public async convert(): Promise<ProjectReflection | undefined> {
        const start = Date.now();
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
                i18n.unsupported_ts_version_0(
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
            const errors = programs.flatMap((program) => ts.getPreEmitDiagnostics(program));
            if (errors.length) {
                diagnostics(this.logger, errors);
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

    private watchers = new Map<string, ts.FileWatcher>();
    private _watchFile?: (path: string, shouldRestart?: boolean) => void;
    private criticalFiles = new Set<string>();

    private clearWatches() {
        this.watchers.forEach((w) => w.close());
        this.watchers.clear();
    }

    private watchConfigFile(path: string) {
        this.criticalFiles.add(path);
    }

    /**
     * Register that the current build depends on a file, so that in watch mode
     * the build will be repeated.  Has no effect if a watch build is not
     * running, or if the file has already been registered.
     *
     * @param path The file to watch.  It does not need to exist, and you should
     * in fact register files you look for, but which do not exist, so that if
     * they are created the build will re-run.  (e.g. if you look through a list
     * of 5 possibilities and find the third, you should register the first 3.)
     *
     * @param shouldRestart Should the build be completely restarted?  (This is
     * normally only used for configuration files -- i.e. files whose contents
     * determine how conversion, rendering, or compiling will be done, as
     * opposed to files that are only read *during* the conversion or
     * rendering.)
     */
    public watchFile(path: string, shouldRestart = false) {
        this._watchFile?.(path, shouldRestart);
    }

    /**
     * Run a convert / watch process.
     *
     * @param success Callback to run after each convert, receiving the project
     * @returns True if the watch process should be restarted due to a
     * configuration change, false for an options error
     */
    public async convertAndWatch(
        success: (project: ProjectReflection) => Promise<void>,
    ): Promise<boolean> {
        if (
            !this.options.getValue("preserveWatchOutput") &&
            this.logger instanceof FancyConsoleLogger
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
                i18n.unsupported_ts_version_0(
                    supportedVersionMajorMinor.join(", "),
                ),
            );
        }

        if (Object.keys(this.options.getCompilerOptions()).length === 0) {
            this.logger.warn(i18n.no_compiler_options_set());
        }

        // Doing this is considerably more complicated, we'd need to manage an array of programs, not convert until all programs
        // have reported in the first time... just error out for now. I'm not convinced anyone will actually notice.
        if (this.options.getFileNames().length === 0) {
            this.logger.error(i18n.solution_not_supported_in_watch_mode());
            return false;
        }

        // Support for packages mode is currently unimplemented
        if (
            this.entryPointStrategy !== EntryPointStrategy.Resolve &&
            this.entryPointStrategy !== EntryPointStrategy.Expand
        ) {
            this.logger.error(i18n.strategy_not_supported_in_watch_mode());
            return false;
        }

        const tsconfigFile = findTsConfigFile(this.options.getValue("tsconfig")) ??
            "tsconfig.json";

        // We don't want to do it the first time to preserve initial debug status messages. They'll be lost
        // after the user saves a file, but better than nothing...
        let firstStatusReport = true;

        const host = ts.createWatchCompilerHost(
            tsconfigFile,
            this.options.fixCompilerOptions({}),
            ts.sys,
            ts.createEmitAndSemanticDiagnosticsBuilderProgram,
            (d) => diagnostic(this.logger, d),
            (status, newLine, _options, errorCount) => {
                if (
                    !firstStatusReport &&
                    errorCount === void 0 &&
                    !this.options.getValue("preserveWatchOutput") &&
                    this.logger instanceof FancyConsoleLogger
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
        let lastProgram = currentProgram;
        let restarting = false;

        this._watchFile = (path: string, shouldRestart = false) => {
            this.logger.verbose(
                `Watching ${nicePath(path)}, shouldRestart=${shouldRestart}`,
            );
            if (this.watchers.has(path)) return;
            this.watchers.set(
                path,
                host.watchFile(
                    path,
                    (file) => {
                        if (shouldRestart) {
                            restartMain(file);
                        } else if (!currentProgram) {
                            currentProgram = lastProgram;
                            this.logger.info(
                                i18n.file_0_changed_rebuilding(
                                    nicePath(file),
                                ),
                            );
                        }
                        if (successFinished) runSuccess();
                    },
                    2000,
                ),
            );
        };

        /** resolver for the returned promise  */
        let exitWatch: (restart: boolean) => unknown;
        const restartMain = (file: string) => {
            if (restarting) return;
            this.logger.info(
                i18n.file_0_changed_restarting(nicePath(file)),
            );
            restarting = true;
            currentProgram = undefined;
            this.clearWatches();
            tsWatcher.close();
        };

        const runSuccess = () => {
            if (restarting && successFinished) {
                successFinished = false;
                exitWatch(true);
                return;
            }

            if (!currentProgram) {
                return;
            }

            if (successFinished) {
                if (
                    this.options.getValue("emit") === "both" &&
                    currentProgram !== lastProgram
                ) {
                    currentProgram.emit();
                }
                // Save for possible re-run due to non-.ts file change
                lastProgram = currentProgram;

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
                this.clearWatches();
                this.criticalFiles.forEach((path) => this.watchFile(path, true));
                const project = this.converter.convert(entryPoints);
                currentProgram = undefined;
                successFinished = false;
                void success(project).then(() => {
                    successFinished = true;
                    runSuccess();
                });
            }
        };

        const origAfterProgramCreate = host.afterProgramCreate;
        host.afterProgramCreate = (program) => {
            if (
                !restarting &&
                ts.getPreEmitDiagnostics(program.getProgram()).length === 0
            ) {
                currentProgram = program.getProgram();
                runSuccess();
            }
            origAfterProgramCreate?.(program);
        };

        const tsWatcher = ts.createWatchProgram(host);

        // Don't return to caller until the watch needs to restart
        return await new Promise((res) => {
            exitWatch = res;
        });
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
            const packagesRequiringDocumentation = this.options.isSet("packagesRequiringDocumentation")
                ? this.options.getValue("packagesRequiringDocumentation")
                : [project.packageName ?? ReflectionSymbolId.UNKNOWN_PACKAGE];

            validateDocumentation(
                project,
                this.logger,
                this.options.getValue("requiredToBeDocumented"),
                this.options.getValue("intentionallyNotDocumented"),
                packagesRequiringDocumentation,
            );
        }

        if (checks.invalidLink) {
            validateLinks(project, this.logger);
        }

        if (checks.unusedMergeModuleWith) {
            validateMergeModuleWith(project, this.logger);
        }

        this.trigger(Application.EVENT_VALIDATE_PROJECT, project);

        this.logger.verbose(`Validation took ${Date.now() - start}ms`);
    }

    /**
     * Render outputs selected with options for the specified project
     */
    public async generateOutputs(project: ProjectReflection): Promise<void> {
        await this.outputs.writeOutputs(project);
    }

    /**
     * Render HTML for the given project
     */
    public async generateDocs(
        project: ProjectReflection,
        out: string,
    ): Promise<void> {
        await this.outputs.writeOutput(
            {
                name: "html",
                path: out,
            },
            project,
        );
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
        await this.outputs.writeOutput(
            {
                name: "json",
                path: out,
            },
            project,
        );
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
            this.logger.error(i18n.no_entry_points_for_packages());
            return;
        }

        const packageDirs = getPackageDirectories(
            this.logger,
            this.options,
            this.options.getValue("entryPoints"),
        );

        if (packageDirs.length === 0) {
            this.logger.error(i18n.failed_to_find_packages());
            return;
        }

        const origFiles = this.files;
        const origOptions = this.options;
        const projects: JSONOutput.ProjectReflection[] = [];

        for (const opt of Object.keys(this.options.getValue("packageOptions"))) {
            if (rootPackageOptions.includes(opt as never)) {
                this.logger.warn(
                    i18n.package_option_0_should_be_specified_at_root(
                        opt,
                    ),
                );
            }
        }

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
                    i18n.previous_error_occurred_when_reading_options_for_0(
                        nicePath(dir),
                    ),
                );
                continue;
            }

            await opts.read(this.logger, dir);
            // Invalid links should only be reported after everything has been merged.
            // Same goes for @mergeModuleWith, should only be validated after merging
            // everything together.
            opts.setValue("validation", {
                invalidLink: false,
                unusedMergeModuleWith: false,
            });
            if (
                opts.getValue("entryPointStrategy") ===
                    EntryPointStrategy.Packages
            ) {
                this.logger.error(
                    i18n.nested_packages_unsupported_0(nicePath(dir)),
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
            this.logger.info(i18n.converting_project_at_0(nicePath(dir)));
            this.options = options;
            this.files = new ValidatingFileRegistry();
            let project = await this.convert();
            if (project) {
                this.validate(project);
                const serialized = this.serializer.projectToObject(
                    project,
                    normalizePath(process.cwd()),
                );
                projects.push(serialized);
            }

            // When debugging memory issues, it's useful to set these
            // here so that a breakpoint on the continue statement below
            // gets the memory as it ought to be with all TS objects released.
            project = undefined;
            this.files = undefined!;
            // global.gc!();

            continue;
        }

        this.options = origOptions;
        this.files = origFiles;

        if (projects.length !== packageDirs.length) {
            this.logger.error(i18n.failed_to_convert_packages());
            return;
        }

        this.logger.info(i18n.merging_converted_projects());
        const result = this.deserializer.reviveProjects(
            this.options.getValue("name") || "Documentation",
            projects,
            {
                projectRoot: normalizePath(process.cwd()),
                registry: this.files,
                alwaysCreateEntryPointModule: this.options.getValue("alwaysCreateEntryPointModule"),
            },
        );
        this.converter.addProjectDocuments(result);
        this.trigger(ApplicationEvents.REVIVE, result);
        return result;
    }

    private _merge(): ProjectReflection | undefined {
        const start = Date.now();

        if (!this.options.isSet("entryPoints")) {
            this.logger.error(i18n.no_entry_points_to_merge());
            return;
        }

        const rootDir = deriveRootDir(this.entryPoints);
        const entryPoints = this.entryPoints.flatMap((entry) => {
            const result = glob(entry, rootDir);

            if (result.length === 0) {
                this.logger.warn(
                    i18n.entrypoint_did_not_match_files_0(nicePath(entry)),
                );
            } else if (result.length !== 1) {
                this.logger.verbose(
                    `Expanded ${nicePath(entry)} to:\n\t${
                        result
                            .map(nicePath)
                            .join("\n\t")
                    }`,
                );
            }

            return result;
        });

        const jsonProjects = entryPoints.map((path) => {
            try {
                return JSON.parse(readFile(path));
            } catch {
                this.logger.error(
                    i18n.failed_to_parse_json_0(nicePath(path)),
                );
                return null;
            }
        });
        if (this.logger.hasErrors()) return;

        const result = this.deserializer.reviveProjects(
            this.options.getValue("name"),
            jsonProjects,
            {
                projectRoot: normalizePath(process.cwd()),
                registry: this.files,
                alwaysCreateEntryPointModule: this.options.getValue("alwaysCreateEntryPointModule"),
            },
        );
        this.converter.addProjectDocuments(result);
        this.logger.verbose(`Reviving projects took ${Date.now() - start}ms`);

        this.trigger(ApplicationEvents.REVIVE, result);
        return result;
    }
}
