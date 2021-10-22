import { resolve, join } from "path";
import { existsSync, statSync } from "fs";

import * as ts from "typescript";

import type { OptionsReader, Options } from "../options";
import type { Logger } from "../../loggers";
import { normalizePath } from "../../fs";
import { ok } from "assert";

function isFile(file: string) {
    return existsSync(file) && statSync(file).isFile();
}

function isDir(path: string) {
    return existsSync(path) && statSync(path).isDirectory();
}

export class TSConfigReader implements OptionsReader {
    /**
     * Note: Runs after the {@link TypeDocReader}.
     */
    priority = 200;

    name = "tsconfig-json";

    /**
     * Not considered part of the public API. You can use it, but it might break.
     * @internal
     */
    static findConfigFile(file: string): string | undefined {
        let fileToRead: string | undefined = file;
        if (isDir(fileToRead)) {
            fileToRead = ts.findConfigFile(file, isFile);
        }

        if (!fileToRead || !isFile(fileToRead)) {
            return;
        }

        return fileToRead;
    }

    read(container: Options, logger: Logger): void {
        const file = container.getValue("tsconfig");

        let fileToRead = TSConfigReader.findConfigFile(file);

        if (!fileToRead) {
            // If the user didn't give us this option, we shouldn't complain about not being able to find it.
            if (container.isSet("tsconfig")) {
                logger.error(`The tsconfig file ${file} does not exist`);
            }
            return;
        }

        fileToRead = normalizePath(resolve(fileToRead));

        let fatalError = false as boolean;
        const parsed = ts.getParsedCommandLineOfConfigFile(
            fileToRead,
            {},
            {
                ...ts.sys,
                onUnRecoverableConfigFileDiagnostic(error) {
                    logger.diagnostic(error);
                    fatalError = true;
                },
            }
        );

        if (!parsed || fatalError) {
            return;
        }

        logger.diagnostics(parsed.errors);

        const typedocOptions = parsed.raw?.typedocOptions ?? {};
        if (typedocOptions.options) {
            logger.error(
                [
                    "typedocOptions in tsconfig file specifies an option file to read but the option",
                    "file has already been read. This is likely a misconfiguration.",
                ].join(" ")
            );
            delete typedocOptions.options;
        }
        if (typedocOptions.tsconfig) {
            logger.error(
                "typedocOptions in tsconfig file may not specify a tsconfig file to read"
            );
            delete typedocOptions.tsconfig;
        }

        container.setCompilerOptions(
            parsed.fileNames,
            parsed.options,
            parsed.projectReferences
        );
        for (const [key, val] of Object.entries(typedocOptions || {})) {
            try {
                // We catch the error, so can ignore the strict type checks
                container.setValue(
                    key as never,
                    val as never,
                    join(fileToRead, "..")
                );
            } catch (error) {
                ok(error instanceof Error);
                logger.error(error.message);
            }
        }
    }
}
