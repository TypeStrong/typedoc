import type { OptionsReader } from "..";
import type { Logger } from "../../loggers";
import type { Options } from "../options";
import { ok } from "assert";
import { nicePath } from "../../paths";
import { discoverPackageJson } from "../../fs";
import { dirname } from "path";

export class PackageJsonReader implements OptionsReader {
    // Should run after the TypeDoc config reader but before the TS config
    // reader, so that it can still specify a path to a `tsconfig.json` file.
    order = 150;

    supportsPackages = true;

    name = "package-json";

    read(container: Options, logger: Logger, cwd: string): Promise<void> {
        const result = discoverPackageJson(cwd);

        if (!result) {
            return Promise.resolve();
        }

        const { file, content } = result;

        if ("typedoc" in content) {
            logger.warn(
                `The 'typedoc' key in ${nicePath(
                    file
                )} was used by the legacy-packages entryPointStrategy and will be ignored.`
            );
        }

        const optsKey = "typedocOptions";
        if (!(optsKey in content)) {
            return Promise.resolve();
        }

        const opts = content[optsKey];
        if (opts === null || typeof opts !== "object") {
            logger.error(
                `Failed to parse the "typedocOptions" field in ${nicePath(
                    file
                )}, ensure it exists and contains an object.`
            );
            return Promise.resolve();
        }

        for (const [opt, val] of Object.entries(opts)) {
            try {
                container.setValue(opt as never, val as never, dirname(file));
            } catch (err) {
                ok(err instanceof Error);
                logger.error(err.message);
            }
        }
        return Promise.resolve();
    }
}
