import { join, dirname, resolve } from "path";
import * as FS from "fs";
import * as ts from "typescript";

import type { OptionsReader } from "..";
import type { Logger } from "../../loggers";
import type { Options } from "../options";
import { ok } from "assert";
import { nicePath } from "../../paths";
import { normalizePath } from "../../fs";
import { createRequire } from "module";

/**
 * Obtains option values from typedoc.json
 * or typedoc.js (discouraged since ~0.14, don't fully deprecate until API has stabilized)
 */
export class TypeDocReader implements OptionsReader {
    /**
     * Should run before the tsconfig reader so that it can specify a tsconfig file to read.
     */
    priority = 100;

    name = "typedoc-json";

    /**
     * Read user configuration from a typedoc.json or typedoc.js configuration file.
     * @param container
     * @param logger
     */
    read(container: Options, logger: Logger): void {
        const path = container.getValue("options");
        const file = this.findTypedocFile(path);

        if (!file) {
            if (container.isSet("options")) {
                logger.error(
                    `The options file ${nicePath(path)} does not exist.`
                );
            }
            return;
        }

        const seen = new Set<string>();
        this.readFile(file, container, logger, seen);
    }

    /**
     * Read the given options file + any extended files.
     * @param file
     * @param container
     * @param logger
     */
    private readFile(
        file: string,
        container: Options & { setValue(key: string, value: unknown): void },
        logger: Logger,
        seen: Set<string>
    ) {
        if (seen.has(file)) {
            logger.error(
                `Tried to load the options file ${nicePath(
                    file
                )} multiple times.`
            );
            return;
        }
        seen.add(file);

        let fileContent: any;
        if (file.endsWith(".json")) {
            const readResult = ts.readConfigFile(normalizePath(file), (path) =>
                FS.readFileSync(path, "utf-8")
            );

            if (readResult.error) {
                logger.error(
                    `Failed to parse ${nicePath(
                        file
                    )}, ensure it exists and contains an object.`
                );
                return;
            } else {
                fileContent = readResult.config;
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            fileContent = require(file);
        }

        if (typeof fileContent !== "object" || !fileContent) {
            logger.error(
                `The root value of ${nicePath(file)} is not an object.`
            );
            return;
        }

        // clone option object to avoid of property changes in re-calling this file
        const data = { ...fileContent };
        delete data["$schema"]; // Useful for better autocompletion, should not be read as a key.

        if ("extends" in data) {
            const resolver = createRequire(file);
            const extended: string[] = getStringArray(data["extends"]);
            for (const extendedFile of extended) {
                let resolvedParent: string;
                try {
                    resolvedParent = resolver.resolve(extendedFile);
                } catch {
                    logger.error(
                        `Failed to resolve ${extendedFile} to a file in ${nicePath(
                            file
                        )}`
                    );
                    continue;
                }
                this.readFile(resolvedParent, container, logger, seen);
            }
            delete data["extends"];
        }

        for (const [key, val] of Object.entries(data)) {
            try {
                container.setValue(
                    key as never,
                    val as never,
                    resolve(dirname(file))
                );
            } catch (error) {
                ok(error instanceof Error);
                logger.error(error.message);
            }
        }
    }

    /**
     * Search for the typedoc.js or typedoc.json file from the given path
     *
     * @param  path Path to the typedoc.(js|json) file. If path is a directory
     *   typedoc file will be attempted to be found at the root of this path
     * @param logger
     * @return the typedoc.(js|json) file path or undefined
     */
    private findTypedocFile(path: string): string | undefined {
        path = resolve(path);

        return [
            path,
            join(path, "typedoc.json"),
            join(path, "typedoc.js"),
            join(path, ".config/typedoc.js"),
            join(path, ".config/typedoc.json"),
        ].find((path) => FS.existsSync(path) && FS.statSync(path).isFile());
    }
}

function getStringArray(arg: unknown): string[] {
    return Array.isArray(arg) ? arg.map(String) : [String(arg)];
}
