import { Theme as ShikiTheme } from "shiki";
import { LogLevel } from "../loggers";
import { SortStrategy } from "../sort";
import { isAbsolute, join, resolve } from "path";

/**
 * An interface describing all TypeDoc specific options. Generated from a
 * map which contains more information about each option for better types when
 * defining said options.
 */
export type TypeDocOptions = {
    [K in keyof TypeDocOptionMap]: TypeDocOptionMap[K] extends Record<
        string,
        infer U
    >
        ? Exclude<U, string> | keyof TypeDocOptionMap[K]
        : TypeDocOptionMap[K];
};

/**
 * Describes all TypeDoc specific options as returned by {@link Options.getValue}, this is
 * slightly more restrictive than the {@link TypeDocOptions} since it does not allow both
 * keys and values for mapped option types.
 */
export type TypeDocOptionValues = {
    [K in keyof TypeDocOptionMap]: TypeDocOptionMap[K] extends Record<
        string,
        infer U
    >
        ? Exclude<U, string>
        : TypeDocOptionMap[K];
};

/**
 * Describes all TypeDoc options. Used internally to provide better types when fetching options.
 * External consumers should likely use [[TypeDocOptions]] instead.
 */
export interface TypeDocOptionMap {
    options: string;
    tsconfig: string;
    packages: string[];

    entryPoints: string[];
    exclude: string[];
    externalPattern: string[];
    excludeExternals: boolean;
    excludePrivate: boolean;
    excludeProtected: boolean;
    excludeNotDocumented: boolean;
    excludeInternal: boolean;
    disableSources: boolean;
    includes: string;
    media: string;

    emit: boolean;
    watch: boolean;
    preserveWatchOutput: boolean;

    out: string;
    json: string;
    export: string;
    import: string;
    pretty: boolean;

    theme: string;
    name: string;
    includeVersion: boolean;
    excludeTags: string[];
    readme: string;
    defaultCategory: string;
    categoryOrder: string[];
    categorizeByGroup: boolean;
    sort: SortStrategy[];
    gitRevision: string;
    gitRemote: string;
    gaID: string;
    gaSite: string;
    hideGenerator: boolean;
    toc: string[];
    disableOutputCheck: boolean;

    help: boolean;
    version: boolean;
    showConfig: boolean;
    plugin: string[];
    logger: unknown; // string | Function
    logLevel: typeof LogLevel;
    treatWarningsAsErrors: boolean;
    listInvalidSymbolLinks: boolean;
    markedOptions: unknown;

    highlightTheme: ShikiTheme;
}

/**
 * Converts a given TypeDoc option key to the type of the declaration expected.
 */
export type KeyToDeclaration<K extends keyof TypeDocOptionMap> =
    TypeDocOptionMap[K] extends boolean
        ? BooleanDeclarationOption
        : TypeDocOptionMap[K] extends string
        ? StringDeclarationOption
        : TypeDocOptionMap[K] extends number
        ? NumberDeclarationOption
        : TypeDocOptionMap[K] extends string[]
        ? ArrayDeclarationOption
        : unknown extends TypeDocOptionMap[K]
        ? MixedDeclarationOption
        : TypeDocOptionMap[K] extends Record<string | number, infer U>
        ? MapDeclarationOption<U>
        : never;

export enum ParameterHint {
    File,
    Directory,
}

export enum ParameterType {
    String,
    /**
     * Resolved according to the config directory.
     */
    Path,
    Number,
    Boolean,
    Map,
    Mixed,
    Array,
    /**
     * Resolved according to the config directory.
     */
    PathArray,
    /**
     * Resolved according to the config directory if it starts with `.`
     */
    ModuleArray,
    /**
     * Resolved according to the config directory unless it starts with `**`, after skipping any leading `!` and `#` characters.
     */
    GlobArray,
}

export interface DeclarationOptionBase {
    /**
     * The option name.
     */
    name: string;

    /**
     * The help text to be displayed to the user when --help is passed.
     */
    help: string;

    /**
     * The parameter type, used to convert user configuration values into the expected type.
     * If not set, the type will be a string.
     */
    type?: ParameterType;
}

export interface StringDeclarationOption extends DeclarationOptionBase {
    /**
     * Specifies the resolution strategy. If `Path` is provided, values will be resolved according to their
     * location in a file. If `String` or no value is provided, values will not be resolved.
     */
    type?: ParameterType.String | ParameterType.Path;

    /**
     * If not specified defaults to the empty string for both `String` and `Path`.
     */
    defaultValue?: string;

    /**
     * An optional hint for the type of input expected, will be displayed in the help output.
     */
    hint?: ParameterHint;

    /**
     * An optional validation function that validates a potential value of this option.
     * The function must throw an Error if the validation fails and should do nothing otherwise.
     */
    validate?: (value: string) => void;
}

export interface NumberDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Number;

    /**
     * Lowest possible value.
     */
    minValue?: number;

    /**
     * Highest possible value.
     */
    maxValue?: number;

    /**
     * If not specified defaults to 0.
     */
    defaultValue?: number;

    /**
     * An optional validation function that validates a potential value of this option.
     * The function must throw an Error if the validation fails and should do nothing otherwise.
     */
    validate?: (value: number) => void;
}

export interface BooleanDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Boolean;

    /**
     * If not specified defaults to false.
     */
    defaultValue?: boolean;
}

export interface ArrayDeclarationOption extends DeclarationOptionBase {
    type:
        | ParameterType.Array
        | ParameterType.PathArray
        | ParameterType.ModuleArray
        | ParameterType.GlobArray;

    /**
     * If not specified defaults to an empty array.
     */
    defaultValue?: string[];

    /**
     * An optional validation function that validates a potential value of this option.
     * The function must throw an Error if the validation fails and should do nothing otherwise.
     */
    validate?: (value: string[]) => void;
}

export interface MixedDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Mixed;

    /**
     * If not specified defaults to undefined.
     */
    defaultValue?: unknown;

    /**
     * An optional validation function that validates a potential value of this option.
     * The function must throw an Error if the validation fails and should do nothing otherwise.
     */
    validate?: (value: unknown) => void;
}

export interface MapDeclarationOption<T> extends DeclarationOptionBase {
    type: ParameterType.Map;

    /**
     * Maps a given value to the option type. The map type may be a TypeScript enum.
     * In that case, when generating an error message for a mismatched key, the numeric
     * keys will not be listed.
     */
    map: Map<string, T> | Record<string | number, T>;

    /**
     * Unlike the rest of the option types, there is no sensible generic default for mapped option types.
     * The default value for a mapped type must be specified.
     */
    defaultValue: T;

    /**
     * Optional override for the error reported when an invalid key is provided.
     */
    mapError?: string;
}

export type DeclarationOption =
    | StringDeclarationOption
    | NumberDeclarationOption
    | BooleanDeclarationOption
    | MixedDeclarationOption
    | MapDeclarationOption<unknown>
    | ArrayDeclarationOption;

interface ParameterTypeToOptionTypeMap {
    [ParameterType.String]: string;
    [ParameterType.Path]: string;
    [ParameterType.Number]: number;
    [ParameterType.Boolean]: boolean;
    [ParameterType.Mixed]: unknown;
    [ParameterType.Array]: string[];
    [ParameterType.PathArray]: string[];
    [ParameterType.ModuleArray]: string[];
    [ParameterType.GlobArray]: string[];

    // Special.. avoid this if possible.
    [ParameterType.Map]: unknown;
}

export type DeclarationOptionToOptionType<T extends DeclarationOption> =
    T extends MapDeclarationOption<infer U>
        ? U
        : ParameterTypeToOptionTypeMap[Exclude<T["type"], undefined>];

const converters: {
    [K in ParameterType]: (
        value: unknown,
        option: DeclarationOption & { type: K },
        configPath: string
    ) => ParameterTypeToOptionTypeMap[K];
} = {
    [ParameterType.String](value, option) {
        const stringValue = value == null ? "" : String(value);
        option.validate?.(stringValue);
        return stringValue;
    },
    [ParameterType.Path](value, option, configPath) {
        const stringValue =
            value == null ? "" : resolve(configPath, String(value));
        option.validate?.(stringValue);
        return stringValue;
    },
    [ParameterType.Number](value, option) {
        const numValue = parseInt(String(value), 10) || 0;
        if (!valueIsWithinBounds(numValue, option.minValue, option.maxValue)) {
            throw new Error(
                getBoundsError(option.name, option.minValue, option.maxValue)
            );
        }
        option.validate?.(numValue);
        return numValue;
    },
    [ParameterType.Boolean](value) {
        return !!value;
    },
    [ParameterType.Array](value, option) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        option.validate?.(strArrValue);
        return strArrValue;
    },
    [ParameterType.PathArray](value, option, configPath) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        strArrValue = strArrValue.map((path) => resolve(configPath, path));
        option.validate?.(strArrValue);
        return strArrValue;
    },
    [ParameterType.ModuleArray](value, option, configPath) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        strArrValue = resolveModulePaths(strArrValue, configPath);
        option.validate?.(strArrValue);
        return strArrValue;
    },
    [ParameterType.GlobArray](value, option, configPath) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        strArrValue = resolveGlobPaths(strArrValue, configPath);
        option.validate?.(strArrValue);
        return strArrValue;
    },
    [ParameterType.Map](value, option) {
        const key = String(value).toLowerCase();
        if (option.map instanceof Map) {
            if (option.map.has(key)) {
                return option.map.get(key);
            } else if ([...option.map.values()].includes(value)) {
                return value;
            }
        } else if (key in option.map) {
            return option.map[key];
        } else if (Object.values(option.map).includes(value)) {
            return value;
        }
        throw new Error(
            option.mapError ?? getMapError(option.map, option.name)
        );
    },
    [ParameterType.Mixed](value, option) {
        option.validate?.(value);
        return value;
    },
};

/**
 * The default conversion function used by the Options container. Readers may
 * re-use this conversion function or implement their own. The arguments reader
 * implements its own since 'false' should not be converted to true for a boolean option.
 * @param value The value to convert.
 * @param option The option for which the value should be converted.
 * @returns The result of the conversion. Might be the value or an error.
 */
export function convert(
    value: unknown,
    option: DeclarationOption,
    configPath: string
): unknown {
    const _converters = converters as Record<
        ParameterType,
        (v: unknown, o: DeclarationOption, c: string) => unknown
    >;
    return _converters[option.type ?? ParameterType.String](
        value,
        option,
        configPath
    );
}

const defaultGetters: {
    [K in ParameterType]: (
        option: DeclarationOption & { type: K }
    ) => ParameterTypeToOptionTypeMap[K];
} = {
    [ParameterType.String](option) {
        return option.defaultValue ?? "";
    },
    [ParameterType.Path](option) {
        const defaultStr = option.defaultValue ?? "";
        if (defaultStr == "") {
            return "";
        }
        return isAbsolute(defaultStr)
            ? defaultStr
            : join(process.cwd(), defaultStr);
    },
    [ParameterType.Number](option) {
        return option.defaultValue ?? 0;
    },
    [ParameterType.Boolean](option) {
        return option.defaultValue ?? false;
    },
    [ParameterType.Map](option) {
        return option.defaultValue;
    },
    [ParameterType.Mixed](option) {
        return option.defaultValue;
    },
    [ParameterType.Array](option) {
        return option.defaultValue ?? [];
    },
    [ParameterType.PathArray](option) {
        return (
            option.defaultValue?.map((value) =>
                resolve(process.cwd(), value)
            ) ?? []
        );
    },
    [ParameterType.ModuleArray](option) {
        return (
            option.defaultValue?.map((value) =>
                value.startsWith(".") ? resolve(process.cwd(), value) : value
            ) ?? []
        );
    },
    [ParameterType.GlobArray](option) {
        return resolveGlobPaths(option.defaultValue ?? [], process.cwd());
    },
};

export function getDefaultValue(option: DeclarationOption) {
    const getters = defaultGetters as Record<
        ParameterType,
        (o: DeclarationOption) => unknown
    >;
    return getters[option.type ?? ParameterType.String](option);
}

function resolveGlobPaths(globs: readonly string[], configPath: string) {
    return globs.map((path) => {
        const start = path.match(/^[!#]+/)?.[0] ?? "";
        const remaining = path.substr(start.length);
        if (!remaining.startsWith("**")) {
            return start + resolve(configPath, remaining);
        }
        return start + remaining;
    });
}

function resolveModulePaths(modules: readonly string[], configPath: string) {
    return modules.map((path) => {
        if (path.startsWith(".")) {
            return resolve(configPath, path);
        }
        return path;
    });
}

/**
 * Returns an error message for a map option, indicating that a given value was not one of the values within the map.
 * @param map The values for the option.
 * @param name The name of the option.
 * @returns The error message.
 */
function getMapError(
    map: MapDeclarationOption<unknown>["map"],
    name: string
): string {
    let keys = map instanceof Map ? [...map.keys()] : Object.keys(map);
    const getString = (key: string) =>
        String(map instanceof Map ? map.get(key) : map[key]);

    // If the map is a TS numeric enum we need to filter out the numeric keys.
    // TS numeric enums have the property that every key maps to a value, which maps back to that key.
    if (
        !(map instanceof Map) &&
        keys.every((key) => getString(getString(key)) === key)
    ) {
        // This works because TS enum keys may not be numeric.
        keys = keys.filter((key) => Number.isNaN(parseInt(key, 10)));
    }

    return `${name} must be one of ${keys.join(", ")}`;
}

/**
 * Returns an error message for a value that is out of bounds of the given min and/or max values.
 * @param name The name of the thing the value represents.
 * @param minValue The lower bound of the range of allowed values.
 * @param maxValue The upper bound of the range of allowed values.
 * @returns The error message.
 */
function getBoundsError(
    name: string,
    minValue?: number,
    maxValue?: number
): string {
    if (isFiniteNumber(minValue) && isFiniteNumber(maxValue)) {
        return `${name} must be between ${minValue} and ${maxValue}`;
    } else if (isFiniteNumber(minValue)) {
        return `${name} must be >= ${minValue}`;
    } else {
        return `${name} must be <= ${maxValue}`;
    }
}

/**
 * Checks if the given value is a finite number.
 * @param value The value being checked.
 * @returns True, if the value is a finite number, otherwise false.
 */
function isFiniteNumber(value: unknown): value is number {
    return Number.isFinite(value);
}

/**
 * Checks if a value is between the bounds of the given min and/or max values.
 * @param value The value being checked.
 * @param minValue The lower bound of the range of allowed values.
 * @param maxValue The upper bound of the range of allowed values.
 * @returns True, if the value is within the given bounds, otherwise false.
 */
function valueIsWithinBounds(
    value: number,
    minValue?: number,
    maxValue?: number
): boolean {
    if (isFiniteNumber(minValue) && isFiniteNumber(maxValue)) {
        return minValue <= value && value <= maxValue;
    } else if (isFiniteNumber(minValue)) {
        return minValue <= value;
    } else if (isFiniteNumber(maxValue)) {
        return value <= maxValue;
    } else {
        return true;
    }
}
