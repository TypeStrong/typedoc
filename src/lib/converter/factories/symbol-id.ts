import { ReflectionSymbolId } from "#models";
import { type FileSystem, findPackageForPath, getCommonDirectory, getQualifiedName, normalizePath } from "#node-utils";
import { type NormalizedPath, Validation } from "#utils";
import { existsSync } from "fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

const declarationMapCache = new Map<string, string>();

let transientCount = 0;
const transientIds = new WeakMap<ts.Symbol, number>();

export function createSymbolId(fs: FileSystem, symbol: ts.Symbol, declaration?: ts.Declaration) {
    declaration ??= symbol.declarations?.[0];
    const tsSource = declaration?.getSourceFile().fileName ?? "";
    const sourceFileName = resolveDeclarationMaps(fs, tsSource);
    let packageName: string;
    let packagePath: NormalizedPath;
    const packageInfo = findPackageForPath(tsSource, fs);
    if (packageInfo) {
        let packageDir: string;
        [packageName, packageDir] = packageInfo;
        packagePath = normalizePath(relative(packageDir, sourceFileName));
    } else {
        packageName = ReflectionSymbolId.UNKNOWN_PACKAGE;
        packagePath = normalizePath(sourceFileName);
    }

    let qualifiedName: string;
    if (symbol.declarations?.some(ts.isSourceFile)) {
        qualifiedName = "";
    } else {
        qualifiedName = getQualifiedName(symbol, symbol.name);
    }
    const pos = declaration?.getStart() ?? Infinity;
    let transientId = NaN;
    if (symbol.flags & ts.SymbolFlags.Transient) {
        transientId = transientIds.get(symbol) ?? ++transientCount;
        transientIds.set(symbol, transientId);
    }

    const id = new ReflectionSymbolId({
        packageName,
        packagePath,
        qualifiedName,
    });
    id.pos = pos;
    id.transientId = transientId;
    id.fileName = normalizePath(sourceFileName);

    return id;
}

function resolveDeclarationMaps(fs: FileSystem, file: string): string {
    if (!/\.d\.[cm]?ts$/.test(file)) return file;
    if (declarationMapCache.has(file)) return declarationMapCache.get(file)!;

    const mapFile = file + ".map";
    if (!existsSync(mapFile)) return file;

    let sourceMap: unknown;
    try {
        sourceMap = JSON.parse(fs.readFile(mapFile)) as unknown;
    } catch {
        return file;
    }

    if (
        Validation.validate(
            {
                file: String,
                sourceRoot: Validation.optional(String),
                sources: [Array, String],
            },
            sourceMap,
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

// See also: inferEntryPoints in entry-point.ts
export function addInferredDeclarationMapPaths(
    opts: ts.CompilerOptions,
    files: readonly string[],
) {
    const rootDir = opts.rootDir || getCommonDirectory(files);
    const declDir = opts.declarationDir || opts.outDir || rootDir;

    for (const file of files) {
        const mapFile = normalizePath(
            resolve(declDir, relative(rootDir, file)).replace(
                /\.([cm]?[tj]s)x?$/,
                ".d.$1",
            ),
        );
        declarationMapCache.set(mapFile, file);
    }
}
