import type * as ts from "../ts.js";
import { isDir, isFile } from "./fs.js";
import { createRequire } from "module";
import { dirname, join, resolve } from "path";
import type { Logger } from "#utils";
import { diagnostics } from "./loggers.js";
import { getTypeScriptApi } from "./compiler.js";
import { readJsoncFile } from "./jsonc.js";

export function findTsConfigFile(
    path: string,
    usedFile?: (path: string) => void,
): string | undefined {
    let fileToRead: string | undefined = path;
    if (isDir(fileToRead)) {
        fileToRead = findConfigFile(path, usedFile);
    }

    if (!fileToRead || !isFile(fileToRead)) {
        return;
    }

    return fileToRead;
}

// Like tsc, look for a tsconfig.json in the directory and then in each of its parents.
function findConfigFile(dir: string, usedFile?: (path: string) => void) {
    let current = resolve(dir);
    for (;;) {
        const file = join(current, "tsconfig.json");
        usedFile?.(file);
        if (isFile(file)) {
            return file;
        }
        const parent = dirname(current);
        if (parent === current) {
            return;
        }
        current = parent;
    }
}

// We don't need recursive read checks because that would cause a diagnostic
// when reading the tsconfig for compiler options, which happens first, and we bail before
// doing this in that case.
export function getTypeDocOptionsFromTsConfig(file: string): any {
    const readResult = readJsoncFile(file);

    const result = {};

    if (!readResult) {
        return result;
    }
    const config = readResult.config;

    if ("extends" in config) {
        const resolver = createRequire(file);
        const extended = Array.isArray(config["extends"])
            ? config["extends"].map(String)
            : [String(config["extends"])];

        for (const extendedFile of extended) {
            let resolvedParent: string;
            try {
                resolvedParent = resolver.resolve(extendedFile);
            } catch {
                continue;
            }
            Object.assign(
                result,
                getTypeDocOptionsFromTsConfig(resolvedParent),
            );
        }
    }

    if ("typedocOptions" in config) {
        Object.assign(result, config["typedocOptions"]);
    }

    return result;
}

const tsConfigCache: Record<string, ts.ParsedCommandLine | undefined> = {};

export function readTsConfig(
    path: string,
    logger: Logger,
): ts.ParsedCommandLine | undefined {
    if (tsConfigCache[path]) {
        return tsConfigCache[path];
    }

    const parsed = getTypeScriptApi().parseConfigFile(path);

    diagnostics(logger, parsed.errors);

    tsConfigCache[path] = parsed;
    return parsed;
}
