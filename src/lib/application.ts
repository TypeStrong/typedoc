import * as Path from "path";
import * as FS from "fs";
import * as ts from "typescript";

import { Converter } from "./converter/index";
import { Renderer } from "./output/renderer";
import { Serializer } from "./serialization";
import { ProjectReflection } from "./models/index";
import {
    Logger,
    ConsoleLogger,
    CallbackLogger,
    PluginHost,
    writeFile,
    normalizePath,
} from "./utils/index";
import { createMinimatch } from "./utils/paths";

import {
    AbstractComponent,
    ChildableComponent,
    Component,
    DUMMY_APPLICATION_OWNER,
} from "./utils/component";
import { Options, BindOption } from "./utils";
import { TypeDocOptions } from "./utils/options/declaration";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo = require("../../package.json") as {
    version: string;
    peerDependencies: { typescript: string };
};

const supportedVersionMajorMinor = packageInfo.peerDependencies.typescript
    .split("||")
    .map((version) => version.replace(/^\s*|\.x\s*$/g, ""));

/**
 * The default TypeDoc main application class.
 *
 * This class holds the two main components of TypeDoc, the [[Converter]] and
 * the [[Renderer]]. When running TypeDoc, first the [[Converter]] is invoked which
 * generates a [[ProjectReflection]] from the passed in source files. The
 * [[ProjectReflection]] is a hierarchical model representation of the TypeScript
 * project. Afterwards the model is passed to the [[Renderer]] which uses an instance
 * of [[BaseTheme]] to generate the final documentation.
 *
 * Both the [[Converter]] and the [[Renderer]] are subclasses of the [[AbstractComponent]]
 * and emit a series of events while processing the project. Subscribe to these Events
 * to control the application flow or alter the output.
 */
@Component({ name: "application", internal: true })
export class Application extends ChildableComponent<
    Application,
    AbstractComponent<Application>
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
    serializer: Serializer;

    /**
     * The logger that should be used to output messages.
     */
    logger: Logger;

    options: Options;

    plugins: PluginHost;

    @BindOption("logger")
    loggerType!: string | Function;

    @BindOption("exclude")
    exclude!: Array<string>;

    @BindOption("entryPoints")
    entryPoints!: string[];

    @BindOption("options")
    optionsFile!: string;

    @BindOption("tsconfig")
    project!: string;

    /**
     * The version number of TypeDoc.
     */
    static VERSION = packageInfo.version;

    /**
     * Create a new TypeDoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    constructor() {
        super(DUMMY_APPLICATION_OWNER);

        this.logger = new ConsoleLogger();
        this.options = new Options(this.logger);
        this.options.addDefaultDeclarations();
        this.serializer = new Serializer();
        this.converter = this.addComponent<Converter>("converter", Converter);
        this.renderer = this.addComponent<Renderer>("renderer", Renderer);
        this.plugins = this.addComponent("plugins", PluginHost);
    }

    /**
     * Initialize TypeDoc with the given options object.
     *
     * @param options  The desired options to set.
     */
    bootstrap(options: Partial<TypeDocOptions> = {}): void {
        for (const [key, val] of Object.entries(options)) {
            try {
                this.options.setValue(key as keyof TypeDocOptions, val);
            } catch {
                // Ignore errors, plugins haven't been loaded yet and may declare an option.
            }
        }
        this.options.read(new Logger());

        const logger = this.loggerType;
        if (typeof logger === "function") {
            this.logger = new CallbackLogger(<any>logger);
            this.options.setLogger(this.logger);
        } else if (logger === "none") {
            this.logger = new Logger();
            this.options.setLogger(this.logger);
        }
        this.logger.level = this.options.getValue("logLevel");

        this.plugins.load();

        this.options.reset();
        for (const [key, val] of Object.entries(options)) {
            try {
                this.options.setValue(key as keyof TypeDocOptions, val);
            } catch (error) {
                this.logger.error(error.message);
            }
        }
        this.options.read(this.logger);
    }

    /**
     * Return the application / root component instance.
     */
    get application(): Application {
        return this;
    }

    /**
     * Return the path to the TypeScript compiler.
     */
    public getTypeScriptPath(): string {
        return Path.dirname(require.resolve("typescript"));
    }

    public getTypeScriptVersion(): string {
        return ts.version;
    }

    /**
     * Run the converter for the given set of files and return the generated reflections.
     *
     * @param src  A list of source that should be compiled and converted.
     * @returns An instance of ProjectReflection on success, undefined otherwise.
     */
    public convert(): ProjectReflection | undefined {
        this.logger.verbose(
            "Using TypeScript %s from %s",
            this.getTypeScriptVersion(),
            this.getTypeScriptPath()
        );

        if (
            !supportedVersionMajorMinor.some(
                (version) => version == ts.versionMajorMinor
            )
        ) {
            this.logger.warn(
                `You are running with an unsupported TypeScript version! TypeDoc supports ${supportedVersionMajorMinor.join(
                    ", "
                )}`
            );
        }

        if (Object.keys(this.options.getCompilerOptions()).length === 0) {
            this.logger.warn(
                `No compiler options set. This likely means that TypeDoc did not find your tsconfig.json. Generated documentation will probably be empty.`
            );
        }

        const program = ts.createProgram(
            this.application.options.getFileNames(),
            this.application.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(program);
        if (errors.length) {
            this.logger.diagnostics(errors);
            return;
        }

        return this.converter.convert(
            this.expandInputFiles(this.entryPoints),
            program
        );
    }

    /**
     * Render HTML for the given project
     */
    public generateDocs(project: ProjectReflection, out: string): void {
        out = Path.resolve(out);
        this.renderer.render(project, out);
        if (this.logger.hasErrors()) {
            this.logger.error(
                "Documentation could not be generated due to the errors above."
            );
        } else {
            this.logger.success("Documentation generated at %s", out);
        }
    }

    /**
     * Run the converter for the given set of files and write the reflections to a json file.
     *
     * @param out  The path and file name of the target file.
     * @returns TRUE if the json file could be written successfully, otherwise FALSE.
     */
    public generateJson(project: ProjectReflection, out: string): void {
        out = Path.resolve(out);
        const eventData = {
            outputDirectory: Path.dirname(out),
            outputFile: Path.basename(out),
        };
        const ser = this.serializer.projectToObject(project, {
            begin: eventData,
            end: eventData,
        });
        writeFile(out, JSON.stringify(ser, null, "\t"), false);
        this.logger.success("JSON written to %s", out);
    }

    /**
     * Expand a list of input files.
     *
     * Searches for directories in the input files list and replaces them with a
     * listing of all TypeScript files within them. One may use the ```--exclude``` option
     * to filter out files with a pattern.
     *
     * @param inputFiles  The list of files that should be expanded.
     * @returns  The list of input files with expanded directories.
     */
    public expandInputFiles(inputFiles: readonly string[]): string[] {
        const files: string[] = [];

        const exclude = createMinimatch(this.exclude);

        function isExcluded(fileName: string): boolean {
            return exclude.some((mm) => mm.match(fileName));
        }

        const supportedFileRegex =
            this.options.getCompilerOptions().allowJs ||
            this.options.getCompilerOptions().checkJs
                ? /\.[tj]sx?$/
                : /\.tsx?$/;
        function add(file: string, entryPoint: boolean) {
            let stats: FS.Stats;
            try {
                stats = FS.statSync(file);
            } catch {
                // No permission or a symbolic link, do not resolve.
                return;
            }
            const fileIsDir = stats.isDirectory();
            if (fileIsDir && !file.endsWith("/")) {
                file = `${file}/`;
            }

            if (!entryPoint && isExcluded(normalizePath(file))) {
                return;
            }

            if (fileIsDir) {
                FS.readdirSync(file).forEach((next) => {
                    add(Path.join(file, next), false);
                });
            } else if (supportedFileRegex.test(file)) {
                files.push(normalizePath(file));
            }
        }

        inputFiles.forEach((file) => {
            const resolved = Path.resolve(file);
            if (!FS.existsSync(resolved)) {
                this.logger.warn(
                    `Provided entry point ${file} does not exist and will not be included in the docs.`
                );
                return;
            }

            add(resolved, true);
        });

        return files;
    }

    /**
     * Print the version number.
     */
    toString() {
        return [
            "",
            `TypeDoc ${Application.VERSION}`,
            `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`,
            "",
        ].join("\n");
    }
}
