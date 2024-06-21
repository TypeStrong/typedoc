import type { BundledTheme as ShikiTheme } from "shiki" with { "resolution-mode": "import" };
import type { LogLevel } from "../loggers";
import type { SortStrategy } from "../sort";
import { isAbsolute, join, resolve } from "path";
import type { EntryPointStrategy } from "../entry-point";
import type { ReflectionKind } from "../../models/reflections/kind";
import type { NeverIfInternal } from "..";
import type {
    TranslatedString,
    TranslationProxy,
} from "../../internationalization/internationalization";

/** @enum */
export const EmitStrategy = {
    both: "both", // Emit both documentation and JS
    docs: "docs", // Emit documentation, but not JS (default)
    none: "none", // Emit nothing, just convert and run validation
} as const;
/** @hidden */
export type EmitStrategy = (typeof EmitStrategy)[keyof typeof EmitStrategy];

/**
 * Determines how TypeDoc searches for comments.
 * @enum
 */
export const CommentStyle = {
    JSDoc: "jsdoc",
    Block: "block",
    Line: "line",
    All: "all",
} as const;
export type CommentStyle = (typeof CommentStyle)[keyof typeof CommentStyle];

/**
 * An interface describing all TypeDoc specific options. Generated from a
 * map which contains more information about each option for better types when
 * defining said options.
 * @interface
 */
export type TypeDocOptions = {
    [K in keyof TypeDocOptionMap]: unknown extends TypeDocOptionMap[K]
        ? unknown
        : TypeDocOptionMap[K] extends ManuallyValidatedOption<
                infer ManuallyValidated
            >
          ? ManuallyValidated
          : TypeDocOptionMap[K] extends string | string[] | number | boolean
            ? TypeDocOptionMap[K]
            : TypeDocOptionMap[K] extends Record<string, boolean>
              ? Partial<TypeDocOptionMap[K]> | boolean
              :
                    | keyof TypeDocOptionMap[K]
                    | TypeDocOptionMap[K][keyof TypeDocOptionMap[K]];
};

/**
 * Describes all TypeDoc specific options as returned by {@link Options.getValue}, this is
 * slightly more restrictive than the {@link TypeDocOptions} since it does not allow both
 * keys and values for mapped option types, and does not allow partials of flag values.
 * @interface
 */
export type TypeDocOptionValues = {
    [K in keyof TypeDocOptionMap]: unknown extends TypeDocOptionMap[K]
        ? unknown
        : TypeDocOptionMap[K] extends ManuallyValidatedOption<
                infer ManuallyValidated
            >
          ? ManuallyValidated
          : TypeDocOptionMap[K] extends
                  | string
                  | string[]
                  | number
                  | boolean
                  | Record<string, boolean>
            ? TypeDocOptionMap[K]
            : TypeDocOptionMap[K][keyof TypeDocOptionMap[K]];
};

/**
 * Describes all TypeDoc options. Used internally to provide better types when fetching options.
 * External consumers should likely use {@link TypeDocOptions} instead.
 *
 * If writing a plugin, you may find it useful to use declaration merging to add your options to this interface
 * so that you have autocomplete when using `app.options.getValue`.
 *
 * ```ts
 * declare module "typedoc" {
 *   export interface TypeDocOptionMap {
 *     pluginOption: string[];
 *   }
 * }
 * ```
 */
export interface TypeDocOptionMap {
    // Configuration
    options: string;
    tsconfig: string;
    compilerOptions: unknown;
    plugin: string[];
    lang: string;
    locales: ManuallyValidatedOption<Record<string, Record<string, string>>>;
    packageOptions: ManuallyValidatedOption<TypeDocOptions>;

    // Input
    entryPoints: string[];
    entryPointStrategy: typeof EntryPointStrategy;
    alwaysCreateEntryPointModule: boolean;
    projectDocuments: string[];
    exclude: string[];
    externalPattern: string[];
    excludeExternals: boolean;
    excludeNotDocumented: boolean;
    excludeNotDocumentedKinds: Array<keyof typeof ReflectionKind>;
    excludeInternal: boolean;
    excludePrivate: boolean;
    excludeProtected: boolean;
    excludeReferences: boolean;
    excludeCategories: string[];
    maxTypeConversionDepth: number;
    name: string;
    includeVersion: boolean;
    disableSources: boolean;
    sourceLinkTemplate: string;
    sourceLinkExternal: boolean;
    disableGit: boolean;
    gitRevision: string;
    gitRemote: string;
    readme: string;

    // Output
    out: string;
    json: string;
    pretty: boolean;
    emit: typeof EmitStrategy;
    theme: string;
    lightHighlightTheme: ShikiTheme;
    darkHighlightTheme: ShikiTheme;
    highlightLanguages: string[];
    customCss: string;
    markdownItOptions: ManuallyValidatedOption<Record<string, unknown>>;
    /**
     * Will be called when TypeDoc is setting up the markdown parser to use to render markdown.
     * Can be used to add markdown-it plugins to the parser with code like this:
     *
     * ```ts
     * // typedoc.config.mjs
     * import iterator from "markdown-it-for-inline";
     * export default {
     *     /** @param {MarkdownIt} parser *\/
     *     markdownItLoader(parser) {
     *         parser.use(iterator, "foo_replace", "text", function(tokens, idx) {
     *             tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
     *         });
     *     }
     * }
     * ```
     *
     * Note: Unfortunately, markdown-it doesn't ship its own types, so `parser` isn't
     * strictly typed here.
     */
    markdownItLoader: ManuallyValidatedOption<(parser: any) => void>;
    basePath: string;
    cname: string;
    githubPages: boolean;
    hostedBaseUrl: string;
    useHostedBaseUrlForAbsoluteLinks: boolean;
    cacheBust: boolean;
    hideGenerator: boolean;
    customFooterHtml: string;
    customFooterHtmlDisableWrapper: boolean;
    hideParameterTypesInTitle: boolean;
    searchInComments: boolean;
    searchInDocuments: boolean;
    cleanOutputDir: boolean;
    titleLink: string;
    navigationLinks: ManuallyValidatedOption<Record<string, string>>;
    sidebarLinks: ManuallyValidatedOption<Record<string, string>>;
    navigationLeaves: string[];
    navigation: {
        includeCategories: boolean;
        includeGroups: boolean;
        includeFolders: boolean;
    };
    visibilityFilters: ManuallyValidatedOption<{
        protected?: boolean;
        private?: boolean;
        inherited?: boolean;
        external?: boolean;
        [tag: `@${string}`]: boolean;
    }>;
    searchCategoryBoosts: ManuallyValidatedOption<Record<string, number>>;
    searchGroupBoosts: ManuallyValidatedOption<Record<string, number>>;

    // Comment
    commentStyle: typeof CommentStyle;
    useTsLinkResolution: boolean;
    preserveLinkText: boolean;
    jsDocCompatibility: JsDocCompatibility;
    blockTags: `@${string}`[];
    inlineTags: `@${string}`[];
    modifierTags: `@${string}`[];
    excludeTags: `@${string}`[];
    externalSymbolLinkMappings: ManuallyValidatedOption<
        Record<string, Record<string, string>>
    >;
    cascadedModifierTags: `@${string}`[];

    // Organization
    categorizeByGroup: boolean;
    defaultCategory: string;
    categoryOrder: string[];
    groupOrder: string[];
    sort: SortStrategy[];
    sortEntryPoints: boolean;
    kindSortOrder: ReflectionKind.KindString[];

    // Validation
    treatWarningsAsErrors: boolean;
    treatValidationWarningsAsErrors: boolean;
    intentionallyNotExported: string[];
    validation: ValidationOptions;
    requiredToBeDocumented: ReflectionKind.KindString[];

    // Other
    watch: boolean;
    preserveWatchOutput: boolean;
    help: boolean;
    version: boolean;
    showConfig: boolean;
    logLevel: typeof LogLevel;
    skipErrorChecking: boolean;
}

/**
 * Wrapper type for values in TypeDocOptionMap which are represented with an unknown option type, but
 * have a validation function that checks that they are the given type.
 */
export type ManuallyValidatedOption<T> = { __validated: T };

export type ValidationOptions = {
    /**
     * If set, TypeDoc will produce warnings when a symbol is referenced by the documentation,
     * but is not included in the documentation.
     */
    notExported: boolean;
    /**
     * If set, TypeDoc will produce warnings about \{\@link\} tags which will produce broken links.
     */
    invalidLink: boolean;
    /**
     * If set, TypeDoc will produce warnings about declarations that do not have doc comments
     */
    notDocumented: boolean;
};

export type JsDocCompatibility = {
    /**
     * If set, TypeDoc will treat `@example` blocks as code unless they contain a code block.
     * On by default, this is how VSCode renders blocks.
     */
    exampleTag: boolean;
    /**
     * If set, TypeDoc will treat `@default` blocks as code unless they contain a code block.
     * On by default, this is how VSCode renders blocks.
     */
    defaultTag: boolean;
    /**
     * If set, TypeDoc will warn if a `@inheritDoc` tag is spelled without TSDoc capitalization
     * (i.e. `@inheritdoc`). On by default.
     */
    inheritDocTag: boolean;
    /**
     * If set, TypeDoc will not emit warnings about unescaped `{` and `}` characters encountered
     * when parsing a comment. On by default.
     */
    ignoreUnescapedBraces: boolean;
};

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
                ? MixedDeclarationOption | ObjectDeclarationOption
                : TypeDocOptionMap[K] extends ManuallyValidatedOption<unknown>
                  ?
                        | (MixedDeclarationOption & {
                              validate(
                                  value: unknown,
                                  i18n: TranslationProxy,
                              ): void;
                          })
                        | (ObjectDeclarationOption & {
                              validate(
                                  value: unknown,
                                  i18n: TranslationProxy,
                              ): void;
                          })
                  : TypeDocOptionMap[K] extends Record<string, boolean>
                    ? FlagsDeclarationOption<TypeDocOptionMap[K]>
                    : TypeDocOptionMap[K] extends Record<
                            string | number,
                            infer U
                        >
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
    /**
     * An object which partially merges user-set values into the defaults.
     */
    Object,
    /**
     * An object with true/false flags
     */
    Flags,
}

export interface DeclarationOptionBase {
    /**
     * The option name.
     */
    name: string;

    /**
     * The help text to be displayed to the user when --help is passed.
     *
     * This may be a string, which will be presented directly, or a function,
     * which will be called with an {@link TranslationProxy} so that option help
     * can be translated into the user specified locale.
     */
    help: NeverIfInternal<string> | ((i18n: TranslationProxy) => string);

    /**
     * The parameter type, used to convert user configuration values into the expected type.
     * If not set, the type will be a string.
     */
    type?: ParameterType;

    /**
     * If set, this option will be omitted from `--help`, and attempting to specify it on the command
     * line will produce an error.
     */
    configFileOnly?: boolean;
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
    validate?: (value: string, i18n: TranslationProxy) => void;
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
    validate?: (value: number, i18n: TranslationProxy) => void;
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
    defaultValue?: readonly string[];

    /**
     * An optional validation function that validates a potential value of this option.
     * The function must throw an Error if the validation fails and should do nothing otherwise.
     */
    validate?: (value: string[], i18n: TranslationProxy) => void;
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
    validate?: (value: unknown, i18n: TranslationProxy) => void;
}

export interface ObjectDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Object;

    /**
     * If not specified defaults to undefined.
     */
    defaultValue?: unknown;

    /**
     * An optional validation function that validates a potential value of this option.
     * The function must throw an Error if the validation fails and should do nothing otherwise.
     */
    validate?: (value: unknown, i18n: TranslationProxy) => void;
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
}

export interface FlagsDeclarationOption<T extends Record<string, boolean>>
    extends DeclarationOptionBase {
    type: ParameterType.Flags;

    /**
     * All of the possible flags, with their default values set.
     */
    defaults: T;
}

export type DeclarationOption =
    | StringDeclarationOption
    | NumberDeclarationOption
    | BooleanDeclarationOption
    | MixedDeclarationOption
    | ObjectDeclarationOption
    | MapDeclarationOption<unknown>
    | ArrayDeclarationOption
    | FlagsDeclarationOption<Record<string, boolean>>;

export interface ParameterTypeToOptionTypeMap {
    [ParameterType.String]: string;
    [ParameterType.Path]: string;
    [ParameterType.Number]: number;
    [ParameterType.Boolean]: boolean;
    [ParameterType.Mixed]: unknown;
    [ParameterType.Object]: unknown;
    [ParameterType.Array]: string[];
    [ParameterType.PathArray]: string[];
    [ParameterType.ModuleArray]: string[];
    [ParameterType.GlobArray]: string[];
    [ParameterType.Flags]: Record<string, boolean>;

    // Special.. avoid this if possible.
    [ParameterType.Map]: unknown;
}

export type DeclarationOptionToOptionType<T extends DeclarationOption> =
    T extends MapDeclarationOption<infer U>
        ? U
        : T extends FlagsDeclarationOption<infer U>
          ? U
          : ParameterTypeToOptionTypeMap[Exclude<T["type"], undefined>];

const converters: {
    [K in ParameterType]: (
        value: unknown,
        option: DeclarationOption & { type: K },
        i18n: TranslationProxy,
        configPath: string,
        oldValue: unknown,
    ) => ParameterTypeToOptionTypeMap[K];
} = {
    [ParameterType.String](value, option, i18n) {
        const stringValue = value == null ? "" : String(value);
        option.validate?.(stringValue, i18n);
        return stringValue;
    },
    [ParameterType.Path](value, option, i18n, configPath) {
        const stringValue =
            value == null ? "" : resolve(configPath, String(value));
        option.validate?.(stringValue, i18n);
        return stringValue;
    },
    [ParameterType.Number](value, option, i18n) {
        const numValue = parseInt(String(value), 10) || 0;
        if (!valueIsWithinBounds(numValue, option.minValue, option.maxValue)) {
            throw new Error(
                getBoundsError(
                    option.name,
                    i18n,
                    option.minValue,
                    option.maxValue,
                ),
            );
        }
        option.validate?.(numValue, i18n);
        return numValue;
    },
    [ParameterType.Boolean](value) {
        return !!value;
    },
    [ParameterType.Array](value, option, i18n) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        option.validate?.(strArrValue, i18n);
        return strArrValue;
    },
    [ParameterType.PathArray](value, option, i18n, configPath) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        strArrValue = strArrValue.map((path) => resolve(configPath, path));
        option.validate?.(strArrValue, i18n);
        return strArrValue;
    },
    [ParameterType.ModuleArray](value, option, i18n, configPath) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        strArrValue = resolveModulePaths(strArrValue, configPath);
        option.validate?.(strArrValue, i18n);
        return strArrValue;
    },
    [ParameterType.GlobArray](value, option, i18n, configPath) {
        let strArrValue = new Array<string>();
        if (Array.isArray(value)) {
            strArrValue = value.map(String);
        } else if (typeof value === "string") {
            strArrValue = [value];
        }
        strArrValue = resolveGlobPaths(strArrValue, configPath);
        option.validate?.(strArrValue, i18n);
        return strArrValue;
    },
    [ParameterType.Map](value, option, i18n) {
        const key = String(value);
        if (option.map instanceof Map) {
            if (option.map.has(key)) {
                return option.map.get(key);
            } else if ([...option.map.values()].includes(value)) {
                return value;
            }
        } else if (key in option.map) {
            if (isTsNumericEnum(option.map) && typeof value === "number") {
                return value;
            }
            return option.map[key];
        } else if (Object.values(option.map).includes(value)) {
            return value;
        }
        throw new Error(getMapError(option.map, i18n, option.name));
    },
    [ParameterType.Mixed](value, option, i18n) {
        option.validate?.(value, i18n);
        return value;
    },
    [ParameterType.Object](value, option, i18n, _configPath, oldValue) {
        option.validate?.(value, i18n);
        if (typeof oldValue !== "undefined")
            value = { ...(oldValue as {}), ...(value as {}) };
        return value;
    },
    [ParameterType.Flags](value, option, i18n) {
        if (typeof value === "boolean") {
            value = Object.fromEntries(
                Object.keys(option.defaults).map((key) => [key, value]),
            );
        }

        if (typeof value !== "object" || value == null) {
            throw new Error(
                i18n.expected_object_with_flag_values_for_0(option.name),
            );
        }
        const obj = { ...value } as Record<string, unknown>;

        for (const key of Object.keys(obj)) {
            if (!Object.prototype.hasOwnProperty.call(option.defaults, key)) {
                throw new Error(
                    i18n.flag_0_is_not_valid_for_1_expected_2(
                        key,
                        option.name,
                        Object.keys(option.defaults).join(", "),
                    ),
                );
            }

            if (typeof obj[key] !== "boolean") {
                // Explicit null/undefined, switch to default.
                if (obj[key] == null) {
                    obj[key] = option.defaults[key];
                } else {
                    throw new Error(
                        i18n.flag_values_for_0_must_be_booleans(option.name),
                    );
                }
            }
        }
        return obj as Record<string, boolean>;
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
    i18n: TranslationProxy,
    configPath: string,
    oldValue?: unknown,
): unknown {
    const _converters = converters as Record<
        ParameterType,
        (
            v: unknown,
            o: DeclarationOption,
            i18n: TranslationProxy,
            c: string,
            ov: unknown,
        ) => unknown
    >;
    return _converters[option.type ?? ParameterType.String](
        value,
        option,
        i18n,
        configPath,
        oldValue,
    );
}

const defaultGetters: {
    [K in ParameterType]: (
        option: DeclarationOption & { type: K },
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
    [ParameterType.Object](option) {
        return option.defaultValue;
    },
    [ParameterType.Array](option) {
        return option.defaultValue?.slice() ?? [];
    },
    [ParameterType.PathArray](option) {
        return (
            option.defaultValue?.map((value) =>
                resolve(process.cwd(), value),
            ) ?? []
        );
    },
    [ParameterType.ModuleArray](option) {
        return (
            option.defaultValue?.map((value) =>
                value.startsWith(".") ? resolve(process.cwd(), value) : value,
            ) ?? []
        );
    },
    [ParameterType.GlobArray](option) {
        return resolveGlobPaths(option.defaultValue ?? [], process.cwd());
    },
    [ParameterType.Flags](option) {
        return { ...option.defaults };
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
        const remaining = path.substring(start.length);
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

function isTsNumericEnum(map: Record<string, any>) {
    return Object.values(map).every((key) => map[map[key]] === key);
}

/**
 * Returns an error message for a map option, indicating that a given value was not one of the values within the map.
 * @param map The values for the option.
 * @param name The name of the option.
 * @returns The error message.
 */
function getMapError(
    map: MapDeclarationOption<unknown>["map"],
    i18n: TranslationProxy,
    name: string,
): TranslatedString {
    let keys = map instanceof Map ? [...map.keys()] : Object.keys(map);

    // If the map is a TS numeric enum we need to filter out the numeric keys.
    // TS numeric enums have the property that every key maps to a value, which maps back to that key.
    if (!(map instanceof Map) && isTsNumericEnum(map)) {
        // This works because TS enum keys may not be numeric.
        keys = keys.filter((key) => Number.isNaN(parseInt(key, 10)));
    }

    return i18n.option_0_must_be_one_of_1(name, keys.join(", "));
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
    i18n: TranslationProxy,
    minValue?: number,
    maxValue?: number,
): TranslatedString {
    if (isFiniteNumber(minValue) && isFiniteNumber(maxValue)) {
        return i18n.option_0_must_be_between_1_and_2(
            name,
            String(minValue),
            String(maxValue),
        );
    } else if (isFiniteNumber(minValue)) {
        return i18n.option_0_must_be_equal_to_or_greater_than_1(
            name,
            String(minValue),
        );
    } else {
        return i18n.option_0_must_be_less_than_or_equal_to_1(
            name,
            String(maxValue),
        );
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
    maxValue?: number,
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
