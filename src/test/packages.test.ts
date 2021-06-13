import { deepStrictEqual as equal, ok } from "assert";
import { readFileSync } from "fs";
import { join } from "path";
import { Logger, normalizePath } from "../lib/utils";
import {
    expandPackages,
    getTsEntryPointForPackage,
} from "../lib/utils/package-manifest";

describe("Packages support", () => {
    it("handles monorepos", () => {
        const base = join(__dirname, "packages", "multi-package");
        const logger = new Logger();
        const packages = expandPackages(logger, ".", [base]);

        equal(
            packages,
            [
                join(base, "packages/bar"),
                join(base, "packages/baz"),
                join(base, "packages/foo"),
            ].map(normalizePath)
        );

        const entries = packages.map((p) => {
            const packageJson = join(p, "package.json");
            return getTsEntryPointForPackage(
                logger,
                packageJson,
                JSON.parse(readFileSync(packageJson, "utf-8"))
            );
        });

        equal(entries, [
            join(base, "packages/bar/index.d.ts"),
            join(base, "packages/baz/index.ts"),
            join(base, "packages/foo/index.ts"),
        ]);

        ok(!logger.hasErrors() && !logger.hasWarnings());
    });

    it("handles single packages", () => {
        const base = join(__dirname, "packages", "single-package");
        const logger = new Logger();
        const packages = expandPackages(logger, ".", [base]);

        equal(packages, [normalizePath(base)]);
    });
});
