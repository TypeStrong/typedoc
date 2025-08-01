import type ts from "typescript";
import { existsSync } from "fs";
import { readFile } from "./fs.js";
import { Validation } from "#utils";
import { join, relative, resolve } from "path";
import { getCommonDirectory, normalizePath } from "./paths.js";

const declarationMapCache = new Map<string, string>();

export function resolveDeclarationMaps(file: string): string {
    if (!/\.d\.[cm]?ts$/.test(file)) return file;
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
