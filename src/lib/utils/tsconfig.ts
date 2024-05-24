import ts from "typescript";
import { isFile, isDir, readFile } from "./fs";
import type { Logger } from "./loggers";
import { createRequire } from "module";

export function findTsConfigFile(path: string): string | undefined {
    let fileToRead: string | undefined = path;
    if (isDir(fileToRead)) {
        fileToRead = ts.findConfigFile(path, isFile);
    }

    if (!fileToRead || !isFile(fileToRead)) {
        return;
    }

    return fileToRead;
}

// We don't need recursive read checks because that would cause a diagnostic
// when reading the tsconfig for compiler options, which happens first, and we bail before
// doing this in that case.
export function getTypeDocOptionsFromTsConfig(file: string): any {
    const readResult = ts.readConfigFile(file, readFile);

    const result = {};

    if (readResult.error) {
        return result;
    }

    if ("extends" in readResult.config) {
        const resolver = createRequire(file);
        const extended = Array.isArray(readResult.config.extends)
            ? readResult.config.extends.map(String)
            : [String(readResult.config.extends)];

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

    if ("typedocOptions" in readResult.config) {
        Object.assign(result, readResult.config.typedocOptions);
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

    const parsed = ts.getParsedCommandLineOfConfigFile(
        path,
        {},
        {
            ...ts.sys,
            onUnRecoverableConfigFileDiagnostic: logger.diagnostic.bind(logger),
        },
    );

    if (!parsed) {
        return;
    }

    logger.diagnostics(parsed.errors);

    tsConfigCache[path] = parsed;
    return parsed;
}
