import type ts from "typescript";
import { resolve } from "path";
import { ParameterType } from "./declaration.js";
import type { OutputSpecification } from "../index.js";
import { normalizePath } from "../paths.js";
import type { Application } from "../../../index.js";
import {
    convert,
    type DeclarationOption,
    getDefaultValue,
    type KeyToDeclaration,
    type TypeDocOptionMap,
    type TypeDocOptions,
    type TypeDocOptionValues,
} from "./declaration.js";
import { addTypeDocOptions } from "./sources/index.js";
import { getOptionsHelp } from "./help.js";
import { getSimilarValues, i18n, insertOrderSorted, type Logger, type NeverIfInternal, unique } from "#utils";

/**
 * Describes an option reader that discovers user configuration and converts it to the
 * TypeDoc format.
 */
export interface OptionsReader {
    /**
     * Readers will be processed according to their orders.
     * A higher order indicates that the reader should be called *later*.
     *
     * Note that to preserve expected behavior, the argv reader must have both the lowest
     * order so that it may set the location of config files used by other readers and
     * the highest order so that it can override settings from lower order readers.
     */
    readonly order: number;

    /**
     * The name of this reader so that it may be removed by plugins without the plugin
     * accessing the instance performing the read. Multiple readers may have the same
     * name.
     */
    readonly name: string;

    /**
     * Flag to indicate that this reader should be included in sub-options objects created
     * to read options for packages mode.
     */
    readonly supportsPackages: boolean;

    /**
     * Read options from the reader's source and place them in the options parameter.
     * Options without a declared name may be treated as if they were declared with type
     * {@link ParameterType.Mixed}. Options which have been declared must be converted to the
     * correct type. As an alternative to doing this conversion in the reader,
     * the reader may use {@link Options.setValue}, which will correctly convert values.
     * @param container the options container that provides declarations
     * @param logger logger to be used to report errors
     * @param cwd the directory which should be treated as the current working directory for option file discovery
     * @param usedFile a callback to track files that were read or whose existence was checked, for purposes of restarting a build when watching files
     */
    read(
        container: Options,
        logger: Logger,
        cwd: string,
        usedFile: (file: string) => void,
    ): void | Promise<void>;
}

const optionSnapshots = new WeakMap<
    { __optionSnapshot: never },
    {
        values: Record<string, unknown>;
        set: Set<string>;
    }
>();

/**
 * Maintains a collection of option declarations split into TypeDoc options
 * and TypeScript options. Ensures options are of the correct type for calling
 * code.
 *
 * ### Option Discovery
 *
 * Since plugins commonly add custom options, and TypeDoc does not permit options which have
 * not been declared to be set, options must be read twice. The first time options are read,
 * a noop logger is passed so that any errors are ignored. Then, after loading plugins, options
 * are read again, this time with the logger specified by the application.
 *
 * Options are read in a specific order.
 * 1. argv (0) - Must be read first since it should change the files read when
 *    passing --options or --tsconfig.
 * 2. typedoc-json (100) - Read next so that it can specify the tsconfig.json file to read.
 * 3. tsconfig-json (200) - Last config file reader, cannot specify the typedoc.json file to read.
 * 4. argv (300) - Read argv again since any options set there should override those set in config
 *    files.
 *
 * @group None
 * @summary Contains all of TypeDoc's option declarations & values
 */
export class Options {
    private _readers: OptionsReader[] = [];
    private _declarations = new Map<string, Readonly<DeclarationOption>>();
    private _values: Record<string, unknown> = {};
    private _setOptions = new Set<string>();
    private _compilerOptions: ts.CompilerOptions = {};
    private _fileNames: readonly string[] = [];
    private _projectReferences: readonly ts.ProjectReference[] = [];

    /**
     * In packages mode, the directory of the package being converted.
     */
    packageDir?: string;

    constructor() {
        addTypeDocOptions(this);
    }

    /**
     * Clones the options, intended for use in packages mode.
     */
    copyForPackage(packageDir: string): Options {
        const options = new Options();
        options.packageDir = packageDir;

        options._readers = this._readers.filter(
            (reader) => reader.supportsPackages,
        );
        options._declarations = new Map(this._declarations);
        options.reset();

        for (
            const [key, val] of Object.entries(
                this.getValue("packageOptions"),
            )
        ) {
            options.setValue(key as any, val, packageDir);
        }

        return options;
    }

    /**
     * Take a snapshot of option values now, used in tests only.
     * @internal
     */
    snapshot() {
        const key = {} as { __optionSnapshot: never };

        optionSnapshots.set(key, {
            values: { ...this._values },
            set: new Set(this._setOptions),
        });

        return key;
    }

    /**
     * Take a snapshot of option values now, used in tests only.
     * @internal
     */
    restore(snapshot: { __optionSnapshot: never }) {
        const data = optionSnapshots.get(snapshot)!;
        this._values = { ...data.values };
        this._setOptions = new Set(data.set);
    }

    /**
     * Resets the option bag to all default values.
     * If a name is provided, will only reset that name.
     */
    reset(name?: keyof TypeDocOptions): void;
    reset(name?: NeverIfInternal<string>): void;
    reset(name?: string): void {
        if (name != null) {
            const declaration = this.getDeclaration(name);
            if (!declaration) {
                throw new Error(
                    `Cannot reset an option (${name}) which has not been declared.`,
                );
            }

            this._values[declaration.name] = getDefaultValue(declaration);
            this._setOptions.delete(declaration.name);
        } else {
            for (const declaration of this.getDeclarations()) {
                this._values[declaration.name] = getDefaultValue(declaration);
            }
            this._setOptions.clear();
            this._compilerOptions = {};
            this._fileNames = [];
        }
    }

    /**
     * Adds an option reader that will be used to read configuration values
     * from the command line, configuration files, or other locations.
     * @param reader
     */
    addReader(reader: OptionsReader): void {
        insertOrderSorted(this._readers, reader);
    }

    async read(
        logger: Logger,
        cwd = process.cwd(),
        usedFile: (path: string) => void = () => {},
    ) {
        for (const reader of this._readers) {
            await reader.read(this, logger, cwd, usedFile);
        }
    }

    /**
     * Adds an option declaration to the container with extra type checking to ensure that
     * the runtime type is consistent with the declared type.
     * @param declaration The option declaration that should be added.
     */
    addDeclaration<K extends keyof TypeDocOptions>(
        declaration: { name: K } & KeyToDeclaration<K>,
    ): void;

    /**
     * Adds an option declaration to the container.
     * @param declaration The option declaration that should be added.
     */
    addDeclaration(
        declaration: NeverIfInternal<Readonly<DeclarationOption>>,
    ): void;
    addDeclaration(declaration: Readonly<DeclarationOption>): void {
        const decl = this.getDeclaration(declaration.name);
        if (decl) {
            throw new Error(
                `The option ${declaration.name} has already been registered`,
            );
        } else {
            this._declarations.set(declaration.name, declaration);
        }

        this._values[declaration.name] = getDefaultValue(declaration);
    }

    /**
     * Gets a declaration by one of its names.
     * @param name
     */
    getDeclaration(name: string): Readonly<DeclarationOption> | undefined {
        return this._declarations.get(name);
    }

    /**
     * Gets all declared options.
     */
    getDeclarations(): Readonly<DeclarationOption>[] {
        return unique(this._declarations.values());
    }

    /**
     * Checks if the given option's value is deeply strict equal to the default.
     * @param name
     */
    isSet(name: keyof TypeDocOptions): boolean;
    isSet(name: NeverIfInternal<string>): boolean;
    isSet(name: string): boolean {
        if (!this._declarations.has(name)) {
            throw new Error(
                `Tried to check if an undefined option (${name}) was set`,
            );
        }
        return this._setOptions.has(name);
    }

    /**
     * Gets all of the TypeDoc option values defined in this option container.
     */
    getRawValues(): Readonly<Partial<TypeDocOptionValues>> {
        return this._values;
    }

    /**
     * Gets a value for the given option key, throwing if the option has not been declared.
     * @param name
     */
    getValue<K extends keyof TypeDocOptions>(name: K): TypeDocOptionValues[K];
    getValue(name: NeverIfInternal<string>): unknown;
    getValue(name: string): unknown {
        const declaration = this.getDeclaration(name);
        if (!declaration) {
            const nearNames = this.getSimilarOptions(name);
            throw new Error(
                i18n.unknown_option_0_you_may_have_meant_1(
                    name,
                    nearNames.join("\n\t"),
                ),
            );
        }

        return this._values[declaration.name];
    }

    /**
     * Sets the given declared option. Throws if setting the option fails.
     * @param name
     * @param value
     * @param configPath the directory to resolve Path type values against
     */
    setValue<K extends keyof TypeDocOptions>(
        name: K,
        value: Exclude<TypeDocOptions[K], undefined>,
        configPath?: string,
    ): void;
    setValue(
        name: NeverIfInternal<string>,
        value: NeverIfInternal<unknown>,
        configPath?: NeverIfInternal<string>,
    ): void;
    setValue(name: string, value: unknown, configPath?: string): void {
        const declaration = this.getDeclaration(name);
        if (!declaration) {
            const nearNames = this.getSimilarOptions(name);
            throw new Error(
                i18n.unknown_option_0_you_may_have_meant_1(
                    name,
                    nearNames.join("\n\t"),
                ),
            );
        }

        let oldValue = this._values[declaration.name];
        if (typeof oldValue === "undefined") {
            oldValue = getDefaultValue(declaration);
        }

        const converted = convert(
            value,
            declaration,
            configPath ?? process.cwd(),
            oldValue,
        );

        if (declaration.type === ParameterType.Flags) {
            this._values[declaration.name] = Object.assign(
                {},
                this._values[declaration.name],
                converted,
            );
        } else if (declaration.name === "outputs") {
            // This is very unfortunate... there's probably some smarter way to define options
            // so that this can be done intelligently via the convert function.
            this._values[declaration.name] = (
                converted as OutputSpecification[]
            ).map((c) => {
                return {
                    ...c,
                    path: normalizePath(resolve(configPath ?? process.cwd(), c.path)),
                };
            });
        } else {
            this._values[declaration.name] = converted;
        }
        this._setOptions.add(name);
    }

    /**
     * Gets the set compiler options.
     */
    getCompilerOptions(): ts.CompilerOptions {
        return this.fixCompilerOptions(this._compilerOptions);
    }

    /** @internal */
    fixCompilerOptions(
        options: Readonly<ts.CompilerOptions>,
    ): ts.CompilerOptions {
        const overrides = this.getValue("compilerOptions");
        const result = { ...options };

        if (overrides) {
            Object.assign(result, overrides);
        }

        if (this.getValue("emit") !== "both") {
            result.noEmit = true;
            delete result.emitDeclarationOnly;
        }

        return result;
    }

    /**
     * Gets the file names discovered through reading a tsconfig file.
     */
    getFileNames(): readonly string[] {
        return this._fileNames;
    }

    /**
     * Gets the project references - used in solution style tsconfig setups.
     */
    getProjectReferences(): readonly ts.ProjectReference[] {
        return this._projectReferences;
    }

    /**
     * Sets the compiler options that will be used to get a TS program.
     */
    setCompilerOptions(
        fileNames: readonly string[],
        options: ts.CompilerOptions,
        projectReferences: readonly ts.ProjectReference[] | undefined,
    ) {
        // We do this here instead of in the tsconfig reader so that API consumers which
        // supply a program to `Converter.convert` instead of letting TypeDoc create one
        // can just set the compiler options, and not need to know about this mapping.
        // It feels a bit like a hack... but it's better to have it here than to put it
        // in Application or Converter.
        if (options.stripInternal && !this.isSet("excludeInternal")) {
            this.setValue("excludeInternal", true);
        }
        this._fileNames = fileNames;
        this._compilerOptions = { ...options };
        this._projectReferences = projectReferences ?? [];
    }

    /**
     * Discover similar option names to the given name, for use in error reporting.
     */
    getSimilarOptions(missingName: string): string[] {
        return getSimilarValues(this._declarations.keys(), missingName);
    }

    /**
     * Get the help message to be displayed to the user if `--help` is passed.
     */
    getHelp() {
        return getOptionsHelp(this);
    }
}

/**
 * Binds an option to an accessor. Does not register the option.
 *
 * Note: This is a standard ES decorator. It will not work with pre-TS 5.0 experimental decorators enabled.
 */
export function Option<K extends keyof TypeDocOptionMap>(name: K) {
    return (
        _: unknown,
        _context: ClassAccessorDecoratorContext<
            { application: Application } | { options: Options },
            TypeDocOptionValues[K]
        >,
    ) => {
        return {
            get(this: { application: Application } | { options: Options }) {
                const options = "options" in this ? this.options : this.application.options;
                return options.getValue(name);
            },
            set(_value: never) {
                throw new Error(
                    `Options may not be set via the Option decorator when setting ${name}`,
                );
            },
        };
    };
}
