import { existsSync } from "fs";
import { isAbsolute, join, relative, resolve } from "path";
import ts from "typescript";
import type { JSONOutput, Serializer } from "../../serialization/index";
import { readFile } from "../../utils/fs";
import { getQualifiedName } from "../../utils/tsutils";
import { optional, validate } from "../../utils/validation";
import { normalizePath } from "../../utils";

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
    readonly fileName: string;
    readonly qualifiedName: string;
    /**
     * Note: This is **not** serialized. It exists for sorting by declaration order, but
     * should not be needed when deserializing from JSON.
     */
    pos: number;

    constructor(symbol: ts.Symbol, declaration?: ts.Declaration);
    constructor(json: JSONOutput.ReflectionSymbolId);
    constructor(
        symbol: ts.Symbol | JSONOutput.ReflectionSymbolId,
        declaration?: ts.Declaration
    ) {
        if ("name" in symbol) {
            declaration ??= symbol?.declarations?.[0];
            this.fileName = normalizePath(
                declaration?.getSourceFile().fileName ?? "\0"
            );
            if (symbol.declarations?.some(ts.isSourceFile)) {
                this.qualifiedName = "";
            } else {
                this.qualifiedName = getQualifiedName(symbol, symbol.name);
            }
            this.pos = declaration?.pos ?? Infinity;
        } else {
            this.fileName = symbol.sourceFileName;
            this.qualifiedName = symbol.qualifiedName;
            this.pos = Infinity;
        }
    }

    getStableKey(): ReflectionSymbolIdString {
        if (Number.isFinite(this.pos)) {
            return `${this.fileName}\0${this.qualifiedName}\0${this.pos}` as ReflectionSymbolIdString;
        } else {
            return `${this.fileName}\0${this.qualifiedName}` as ReflectionSymbolIdString;
        }
    }

    toObject(serializer: Serializer) {
        return {
            sourceFileName: isAbsolute(this.fileName)
                ? normalizePath(
                      relative(
                          serializer.projectRoot,
                          resolveDeclarationMaps(this.fileName)
                      )
                  )
                : this.fileName,
            qualifiedName: this.qualifiedName,
        };
    }
}

const declarationMapCache = new Map<string, string>();

/**
 * See also getTsSourceFromJsSource in package-manifest.ts.
 */
function resolveDeclarationMaps(file: string): string {
    if (!file.endsWith(".d.ts")) return file;
    if (declarationMapCache.has(file)) return declarationMapCache.get(file)!;

    const mapFile = file + ".map";
    if (!existsSync(mapFile)) return file;

    let sourceMap: unknown;
    try {
        sourceMap = JSON.parse(readFile(mapFile)) as unknown;
    } catch {
        return file;
    }

    if (
        validate(
            {
                file: String,
                sourceRoot: optional(String),
                sources: [Array, String],
            },
            sourceMap
        )
    ) {
        // There's a pretty large assumption in here that we only have
        // 1 source file per js file. This is a pretty standard typescript approach,
        // but people might do interesting things with transpilation that could break this.
        let source = sourceMap.sources[0];

        // If we have a sourceRoot, trim any leading slash from the source, and join them
        // Similar to how it's done at https://github.com/mozilla/source-map/blob/58819f09018d56ef84dc41ba9c93f554e0645169/lib/util.js#L412
        if (sourceMap.sourceRoot !== undefined) {
            source = source.replace(/^\//, "");
            source = join(sourceMap.sourceRoot, source);
        }

        const result = resolve(mapFile, "..", source);
        declarationMapCache.set(file, result);
        return result;
    }

    return file;
}
