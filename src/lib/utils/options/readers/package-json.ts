import { dirname, join, resolve } from "path";
import * as fs from "fs";

import type { OptionsReader } from "..";
import type { Logger } from "../../loggers";
import type { Options } from "../options";
import { ok } from "assert";
import { nicePath } from "../../paths";

export class PackageJsonReader implements OptionsReader {
    // Should run after the TypeDoc config reader but before the TS config
    // reader, so that it can still specify a path to a `tsconfig.json` file.
    order = 150;

    supportsPackages = true;

    name = "package-json";

    read(container: Options, logger: Logger): void {
        const cfgPath = container.getValue("options");
        const absPath = resolve(cfgPath);

        // Search for `package.json` first at the provided config path, or at
        // `cfgPath/package.json` if the provided path is a directory.
        const path = [absPath, join(absPath, "package.json")].find(
            (p) => fs.existsSync(p) && fs.statSync(p).isFile()
        );

        if (!path) {
            return;
        }

        const content = fs.readFileSync(path, "utf-8");

        let pkg: Record<string, any>;
        try {
            pkg = JSON.parse(content);
            if (pkg === null || typeof pkg !== "object") {
                this.logParsePkgFailure(logger, path);
                return;
            }
        } catch (err) {
            ok(err instanceof Error);
            this.logParsePkgFailure(logger, path);
            return;
        }

        const optsKey = "typedocOptions";
        if (!(optsKey in pkg)) {
            return;
        }

        const opts = pkg[optsKey];
        if (opts === null || typeof opts !== "object") {
            logger.error(
                `Failed to parse the "typedocOptions" field in ${nicePath(
                    path
                )}, ensure it exists and contains an object.`
            );
            return;
        }

        for (const [opt, val] of Object.entries(opts)) {
            try {
                container.setValue(
                    opt as never,
                    val as never,
                    resolve(dirname(path))
                );
            } catch (err) {
                ok(err instanceof Error);
                logger.error(err.message);
            }
        }
    }

    private logParsePkgFailure(logger: Logger, path: string): void {
        logger.error(
            `Failed to parse ${nicePath(
                path
            )}, ensure it exists and contains an object.`
        );
    }
}
