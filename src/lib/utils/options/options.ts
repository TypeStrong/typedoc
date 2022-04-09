import type * as ts from "typescript";
import { ParameterType } from "./declaration";
import type { NeverIfInternal } from "..";
import type { Application } from "../../..";
import { insertPrioritySorted, unique } from "../array";
import type { Logger } from "../loggers";
import {
    convert,
    DeclarationOption,
    getDefaultValue,
    KeyToDeclaration,
    TypeDocOptionMap,
    TypeDocOptions,
    TypeDocOptionValues,
} from "./declaration";
import { addTypeDocOptions } from "./sources";

/**
 * Describes an option reader that discovers user configuration and converts it to the
 * TypeDoc format.
 */
export interface OptionsReader {
    /**
     * Readers will be processed according to their priority.
     * A higher priority indicates that the reader should be called *later* so that
     * it can override options set by lower priority readers.
     *
     * Note that to preserve expected behavior, the argv reader must have both the lowest
     * priority so that it may set the location of config files used by other readers and
     * the highest priority so that it can override settings from lower priority readers.
     *
     * Note: In 0.23. `priority` will be renamed to `order`, with the same meaning
     */
    priority: number;

    /**
     * The name of this reader so that it may be removed by plugins without the plugin
     * accessing the instance performing the read. Multiple readers may have the same
     * name.
     */
    name: string;

    /**
     * Read options from the reader's source and place them in the options parameter.
     * Options without a declared name may be treated as if they were declared with type
     * {@link ParameterType.Mixed}. Options which have been declared must be converted to the
     * correct type. As an alternative to doing this conversion in the reader,
     * the reader may use {@link Options.setValue}, which will correctly convert values.
     * @param options
     * @param compilerOptions
     * @param container the options container that provides declarations
     * @param logger
     */
    read(container: Options, logger: Logger): void;
}

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
 */
export class Options {
    private _readers: OptionsReader[] = [];
    private _declarations = new Map<string, Readonly<DeclarationOption>>();
    private _values: Record<string, unknown> = {};
    private _setOptions = new Set<string>();
    private _compilerOptions: ts.CompilerOptions = {};
    private _fileNames: readonly string[] = [];
    private _projectReferences: readonly ts.ProjectReference[] = [];
    private _logger: Logger;

    constructor(logger: Logger) {
        this._logger = logger;
    }

    /**
     * Marks the options as readonly, enables caching when fetching options, which improves performance.
     */
    freeze() {
        Object.freeze(this._values);
    }

    /**
     * Checks if the options object has been frozen, preventing future changes to option values.
     */
    isFrozen() {
        return Object.isFrozen(this._values);
    }

    /**
     * Sets the logger used when an option declaration fails to be added.
     * @param logger
     */
    setLogger(logger: Logger) {
        this._logger = logger;
    }

    /**
     * Adds the option declarations declared by the TypeDoc and all supported TypeScript declarations.
     */
    addDefaultDeclarations() {
        addTypeDocOptions(this);
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
                    "Cannot reset an option which has not been declared."
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
        insertPrioritySorted(this._readers, reader);
    }

    /**
     * Removes all readers of a given name.
     * @param name
     * @deprecated should not be used, will be removed in 0.23
     */
    removeReaderByName(name: string): void {
        this._readers = this._readers.filter((reader) => reader.name !== name);
    }

    read(logger: Logger) {
        for (const reader of this._readers) {
            reader.read(this, logger);
        }
    }

    /**
     * Adds an option declaration to the container with extra type checking to ensure that
     * the runtime type is consistent with the declared type.
     * @param declaration The option declaration that should be added.
     */
    addDeclaration<K extends keyof TypeDocOptions>(
        declaration: { name: K } & KeyToDeclaration<K>
    ): void;

    /**
     * Adds an option declaration to the container.
     * @param declaration The option declaration that should be added.
     */
    addDeclaration(
        declaration: NeverIfInternal<Readonly<DeclarationOption>>
    ): void;
    addDeclaration(declaration: Readonly<DeclarationOption>): void {
        const decl = this.getDeclaration(declaration.name);
        if (decl) {
            this._logger.error(
                `The option ${declaration.name} has already been registered`
            );
        } else {
            this._declarations.set(declaration.name, declaration);
        }

        this._values[declaration.name] = getDefaultValue(declaration);
    }

    /**
     * Adds the given declarations to the container
     * @param declarations
     * @deprecated will be removed in 0.23.
     */
    addDeclarations(declarations: readonly DeclarationOption[]): void {
        for (const decl of declarations) {
            this.addDeclaration(decl as any);
        }
    }

    /**
     * Removes a declared option.
     * WARNING: This is probably a bad idea. If you do this you will probably cause a crash
     * when code assumes that an option that it declared still exists.
     * @param name
     * @deprecated will be removed in 0.23.
     */
    removeDeclarationByName(name: string): void {
        const declaration = this.getDeclaration(name);
        if (declaration) {
            this._declarations.delete(declaration.name);
            delete this._values[declaration.name];
        }
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
            throw new Error("Tried to check if an undefined option was set");
        }
        return this._setOptions.has(name);
    }

    /**
     * Gets all of the TypeDoc option values defined in this option container.
     */
    getRawValues(): Readonly<Partial<TypeDocOptions>> {
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
            throw new Error(`Unknown option '${name}'`);
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
        value: TypeDocOptions[K],
        configPath?: string
    ): void;
    setValue(
        name: NeverIfInternal<string>,
        value: NeverIfInternal<unknown>,
        configPath?: NeverIfInternal<string>
    ): void;
    setValue(name: string, value: unknown, configPath?: string): void {
        if (this.isFrozen()) {
            throw new Error(
                "Tried to modify an option value after options have been frozen."
            );
        }

        const declaration = this.getDeclaration(name);
        if (!declaration) {
            throw new Error(
                `Tried to set an option (${name}) that was not declared.`
            );
        }

        const converted = convert(
            value,
            declaration,
            configPath ?? process.cwd()
        );

        if (declaration.type === ParameterType.Flags) {
            Object.assign(this._values[declaration.name], converted);
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
        options: Readonly<ts.CompilerOptions>
    ): ts.CompilerOptions {
        const overrides = this.getValue("compilerOptions");
        const result = { ...options };

        if (overrides) {
            Object.assign(result, overrides);
        }

        if (
            this.getValue("emit") !== "both" &&
            this.getValue("emit") !== true
        ) {
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
        projectReferences: readonly ts.ProjectReference[] | undefined
    ) {
        if (this.isFrozen()) {
            throw new Error(
                "Tried to modify an option value after options have been sealed."
            );
        }

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
}

/**
 * Binds an option to the given property. Does not register the option.
 *
 * @since v0.16.3
 */
export function BindOption<K extends keyof TypeDocOptionMap>(
    name: K
): <IK extends PropertyKey>(
    target: ({ application: Application } | { options: Options }) & {
        [K2 in IK]: TypeDocOptionValues[K];
    },
    key: IK
) => void;

/**
 * Binds an option to the given property. Does not register the option.
 * @since v0.16.3
 *
 * @privateRemarks
 * This overload is intended for plugin use only with looser type checks. Do not use internally.
 */
export function BindOption(
    name: NeverIfInternal<string>
): (
    target: { application: Application } | { options: Options },
    key: PropertyKey
) => void;

export function BindOption(name: string) {
    return function (
        target: { application: Application } | { options: Options },
        key: PropertyKey
    ) {
        Object.defineProperty(target, key, {
            get(this: { application: Application } | { options: Options }) {
                const options =
                    "options" in this ? this.options : this.application.options;
                const value = options.getValue(name as keyof TypeDocOptions);

                if (options.isFrozen()) {
                    Object.defineProperty(this, key, { value });
                }

                return value;
            },
            enumerable: true,
            configurable: true,
        });
    };
}
