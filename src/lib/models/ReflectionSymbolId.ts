import type { JSONOutput } from "#serialization";
import { type DeclarationReference, type NormalizedPath } from "#utils";
import { splitUnquotedString } from "./utils.js";

/**
 * See {@link ReflectionSymbolId}
 */
export type ReflectionSymbolIdString = string & {
    readonly __reflectionSymbolId: unique symbol;
};

/**
 * This exists so that TypeDoc can store a unique identifier for a `ts.Symbol` without
 * keeping a reference to the `ts.Symbol` itself. This identifier should be stable across
 * runs so long as the symbol is exported from the same file.
 */
export class ReflectionSymbolId {
    /**
     * This will only be used if we somehow cannot find a package.json file for
     * source code. This is very unlikely, but if it occurs then the {@link packageName}
     * will be set to this string, and {@link packagePath} will have the absolute path
     * to the source file.
     */
    static readonly UNKNOWN_PACKAGE = "<unknown>";

    /**
     * The name of the package which this symbol ID resides within.
     */
    readonly packageName: string;

    /**
     * Path to the source file containing this symbol.
     * Note that this is NOT an absolute path, but a package-relative path according
     * to the directory containing package.json for the package name.
     */
    readonly packagePath: NormalizedPath;

    /**
     * Qualified name of this symbol within the source file.
     */
    readonly qualifiedName: string;

    /**
     * Note: This is **not** serialized. It exists for sorting by declaration order, but
     * should not be needed when deserializing from JSON.
     * Will be set to `Infinity` if the ID was deserialized from JSON.
     */
    pos: number = Infinity;

    /**
     * Note: This is **not** serialized. It exists to support detection of the differences between
     * symbols which share declarations, but are instantiated with different type parameters.
     * This will be `NaN` if the symbol reference is not transient.
     * Note: This can only be non-NaN if {@link pos} is finite.
     */
    transientId: number = NaN;

    /**
     * Note: This is **not** serialized, only {@link packageName} and {@link packagePath} path
     * information is preserved when serializing. This is set so that it is available to plugins
     * when initially converting a project.
     *
     * @privateRemarks
     * This is used by typedoc-plugin-dt-links to determine the path to read to get the source
     * code of a definitely typed package.
     */
    fileName?: NormalizedPath;

    constructor(json: JSONOutput.ReflectionSymbolId) {
        this.packageName = json.packageName;
        this.packagePath = json.packagePath;
        this.qualifiedName = json.qualifiedName;
    }

    getStableKey(): ReflectionSymbolIdString {
        if (Number.isFinite(this.pos)) {
            return `${this.packageName}\0${this.packagePath}\0${this.qualifiedName}\0${this.pos}\0${this.transientId}` as ReflectionSymbolIdString;
        } else {
            return `${this.packageName}\0${this.packagePath}\0${this.qualifiedName}` as ReflectionSymbolIdString;
        }
    }

    toDeclarationReference(): DeclarationReference {
        return {
            resolutionStart: "global",
            moduleSource: this.packageName,
            symbolReference: {
                path: splitUnquotedString(this.qualifiedName, ".").map(
                    (path) => ({
                        navigation: ".",
                        path,
                    }),
                ),
            },
        };
    }

    toObject(): JSONOutput.ReflectionSymbolId {
        return {
            packageName: this.packageName,
            packagePath: this.packagePath,
            qualifiedName: this.qualifiedName,
        };
    }
}
