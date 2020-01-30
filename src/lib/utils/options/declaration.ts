import * as _ from 'lodash';
import { CompilerOptions } from 'typescript';
import { Result } from '../result';
import { IgnoredTsOptionKeys } from './sources/typescript';

/**
 * An interface describing all TypeDoc specific options options. Generated from a
 * map which contains more information about each option for better types when
 * defining said options.
 */
export type TypeDocOptions = {
    [K in keyof TypeDocOptionMap]: TypeDocOptionMap[K] extends Record<string, infer U>
        ? Exclude<U, string> | keyof TypeDocOptionMap[K]
        : TypeDocOptionMap[K];
};

/**
 * The CompilerOptions interface includes an index signature to avoid errors when unknown
 * options are passed. TypeDoc's option parsing is stricter, so we need to remove it.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/25987#issuecomment-408339599
 */
type KnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends {[_ in keyof T]: infer U} ? U : never;

/**
 * All supported options, includes both TypeDoc and TypeScript options.
 */
export type TypeDocAndTSOptions = TypeDocOptions
    & Pick<CompilerOptions, Exclude<KnownKeys<CompilerOptions>, IgnoredTsOptionKeys>>;

export enum SourceFileMode {
    File, Modules, Library
}

/**
 * Describes all TypeDoc options. Used internally to provide better types when fetching options.
 * External consumers should likely use either [[TypeDocAndTSOptions]] or [[TypeDocOptions]].
 */
export interface TypeDocOptionMap {
    options: string;
    tsconfig: string;

    inputFiles: string[];
    mode: { file: SourceFileMode.File, modules: SourceFileMode.Modules, library: SourceFileMode.Library };
    includeDeclarations: boolean;
    entryPoint: string;
    exclude: string[];
    externalPattern: string[];
    excludeExternals: boolean;
    excludeNotExported: boolean;
    excludePrivate: boolean;
    excludeProtected: boolean;
    ignoreCompilerErrors: boolean;
    disableSources: boolean;
    includes: string;
    media: string;

    out: string;
    json: string;

    theme: string;
    name: string;
    includeVersion: boolean;
    readme: string;
    defaultCategory: string;
    categoryOrder: string[];
    categorizeByGroup: boolean;
    gitRevision: string;
    gitRemote: string;
    gaID: string;
    gaSite: string;
    hideGenerator: boolean;
    toc: string[];
    disableOutputCheck: boolean;

    help: boolean;
    version: boolean;
    plugin: string[];
    logger: unknown; // string | Function
    listInvalidSymbolLinks: boolean;
}

/**
 * Converts a given TypeDoc option key to the type of the declaration expected.
 */
export type KeyToDeclaration<K extends keyof TypeDocOptionMap> =
    TypeDocOptionMap[K] extends boolean ? BooleanDeclarationOption :
    TypeDocOptionMap[K] extends string ? StringDeclarationOption :
    TypeDocOptionMap[K] extends number ? NumberDeclarationOption :
    TypeDocOptionMap[K] extends string[] ? ArrayDeclarationOption :
    unknown extends TypeDocOptionMap[K] ? MixedDeclarationOption :
    TypeDocOptionMap[K] extends Record<string | number, infer U> ? MapDeclarationOption<U> :
    never;

export enum ParameterHint {
    File,
    Directory
}

export enum ParameterType {
    String,
    Number,
    Boolean,
    Map,
    Mixed,
    Array
}

export enum ParameterScope {
    TypeDoc,
    TypeScript
}

export interface DeclarationOptionBase {
    /**
     * The option name.
     */
    name: string;

    /**
     * An optional short name for the option.
     */
    short?: string;

    /**
     * The help text to be displayed to the user when --help is passed.
     */
    help: string;

    /**
     * The parameter type, used to convert user configuration values into the expected type.
     * If not set, the type will be a string.
     */
    type?: ParameterType;

    /**
     * Whether the option belongs to TypeDoc or TypeScript.
     * If not specified will be defaulted to TypeDoc.
     */
    scope?: ParameterScope;
}

export interface StringDeclarationOption extends DeclarationOptionBase {
    type?: ParameterType.String;

    /**
     * If not specified defaults to the empty string.
     */
    defaultValue?: string;

    /**
     * An optional hint for the type of input expected, will be displayed in the help output.
     */
    hint?: ParameterHint;
}

export interface NumberDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Number;

    /**
     * If not specified defaults to 0.
     */
    defaultValue?: number;
}

export interface BooleanDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Boolean;

    /**
     * If not specified defaults to false.
     */
    defaultValue?: boolean;
}

export interface ArrayDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Array;

    /**
     * If not specified defaults to an empty array.
     */
    defaultValue?: string[];
}

export interface MixedDeclarationOption extends DeclarationOptionBase {
    type: ParameterType.Mixed;

    /**
     * If not specified defaults to undefined.
     */
    defaultValue?: unknown;
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

export type DeclarationOptionToOptionType<T extends DeclarationOption> =
    T extends StringDeclarationOption ? string :
    T extends NumberDeclarationOption ? number :
    T extends BooleanDeclarationOption ? boolean :
    T extends MixedDeclarationOption ? unknown :
    T extends MapDeclarationOption<infer U> ? U :
    T extends ArrayDeclarationOption ? string[] :
    never;

/**
 * The default conversion function used by the Options container. Readers may
 * re-use this conversion function or implement their own. The arguments reader
 * implements its own since 'false' should not be converted to true for a boolean option.
 *
 * @param value
 * @param option
 */
export function convert<T extends DeclarationOption>(value: unknown, option: T): Result<DeclarationOptionToOptionType<T>, string>;
export function convert<T extends DeclarationOption>(value: unknown, option: T): Result<unknown, string> {
    switch (option.type) {
        case undefined:
        case ParameterType.String:
            return Result.Ok(value == null ? '' : String(value));
        case ParameterType.Number:
            return Result.Ok(parseInt(String(value), 10) || 0);
        case ParameterType.Boolean:
            return Result.Ok(Boolean(value));
        case ParameterType.Array:
            if (Array.isArray(value)) {
                return Result.Ok(value.map(String));
            } else if (typeof value === 'string') {
                return Result.Ok(value.split(','));
            }
            return Result.Ok([]);
        case ParameterType.Map:
            const optionMap = option as MapDeclarationOption<unknown>;
            const key = String(value).toLowerCase();
            if (optionMap.map instanceof Map) {
                if (optionMap.map.has(key)) {
                    return Result.Ok(optionMap.map.get(key));
                }
                if ([...optionMap.map.values()].includes(value)) {
                    return Result.Ok(value);
                }
            } else {
                if (optionMap.map.hasOwnProperty(key)) {
                    return Result.Ok(optionMap.map[key]);
                }
                if (Object.values(optionMap.map).includes(value)) {
                    return Result.Ok(value);
                }
            }
            return Result.Err(optionMap.mapError ?? getMapError(optionMap.map, optionMap.name));
        case ParameterType.Mixed:
            return Result.Ok(value);
    }
}

function getMapError(map: MapDeclarationOption<unknown>['map'], name: string) {
    let keys = map instanceof Map ? [...map.keys()] : Object.keys(map);
    const getString = (key: string) => String(map instanceof Map ? map.get(key) : map[key]);

    // If the map is a TS numeric enum we need to filter out the numeric keys.
    // TS numeric enums have the property that every key maps to a value, which maps back to that key.
    if (!(map instanceof Map) && keys.every(key => getString(getString(key)) === key)) {
        // This works because TS enum keys may not be numeric.
        keys = keys.filter(key => Number.isNaN(parseInt(key, 10)));
    }

    return `${name} must be one of ${keys.join(', ')}`;
}
