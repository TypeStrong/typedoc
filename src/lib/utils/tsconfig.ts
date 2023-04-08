import ts from "typescript";
import { isFile, isDir } from "./fs";
import type { Logger } from "./loggers";

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

const tsConfigCache: Record<string, ts.ParsedCommandLine> = {};

export function readTsConfig(
    path: string,
    logger: Logger
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
        }
    );

    if (!parsed) {
        return;
    }

    logger.diagnostics(parsed.errors);

    tsConfigCache[path] = parsed;
    return parsed;
}
