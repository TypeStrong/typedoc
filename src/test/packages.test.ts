import { deepStrictEqual as equal, ok } from "assert";
import { readFileSync } from "fs";
import { join } from "path";
import { Logger, normalizePath } from "../lib/utils";
import {
    expandPackages,
    getTsEntryPointForPackage,
} from "../lib/utils/package-manifest";

import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { TestLogger } from "./TestLogger";

describe("Packages support", () => {
    let project: ReturnType<typeof tempdirProject>;

    beforeEach(() => {
        project = tempdirProject();
    });

    afterEach(() => {
        project.rm();
    });

    it("handles monorepos", () => {
        project.addJsonFile("tsconfig.json", {
            compilerOptions: {
                strict: true,
                sourceMap: true,
            },
            exclude: ["node_modules", "dist"],
        });
        const childTsconfig = {
            extends: "../../tsconfig.json",
            compilerOptions: {
                outDir: "dist",
            },
        };
        project.addJsonFile("package.json", {
            name: "typedoc-multi-package-example",
            main: "dist/index.js",
            workspaces: ["packages/*"],
        });

        // Bar, types entry point
        project.addFile(
            "packages/bar/index.d.ts",
            "export function bar(): void;"
        );
        project.addJsonFile("packages/bar/package.json", {
            name: "typedoc-multi-package-bar",
            version: "1.0.0",
            types: "index.d.ts",
        });
        project.addJsonFile("packages/bar/tsconfig.json", childTsconfig);

        // Baz, TypeScript "main" entry point
        project.addFile("packages/baz/index.ts", "export function baz(): {}");
        project.addJsonFile("packages/baz/package.json", {
            name: "typedoc-multi-package-baz",
            version: "1.0.0",
            main: "index.ts",
        });
        project.addJsonFile("packages/baz/tsconfig.json", childTsconfig);

        // Foo, entry point with "typedocMain"
        project.addFile("packages/foo/dist/index.js", "module.exports = 123");
        project.addFile("packages/foo/index.ts", "export function foo() {}");
        project.addJsonFile("packages/foo/package.json", {
            name: "typedoc-multi-package-foo",
            version: "1.0.0",
            main: "dist/index",
            typedocMain: "index.ts",
        });
        project.addJsonFile("packages/foo/tsconfig.json", childTsconfig);

        project.write();
        const logger = new TestLogger();
        const packages = expandPackages(logger, project.cwd, [project.cwd]);

        equal(
            packages,
            [
                join(project.cwd, "packages/bar"),
                join(project.cwd, "packages/baz"),
                join(project.cwd, "packages/foo"),
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
            join(project.cwd, "packages/bar/index.d.ts"),
            join(project.cwd, "packages/baz/index.ts"),
            join(project.cwd, "packages/foo/index.ts"),
        ]);

        logger.discardDebugMessages();
        logger.expectNoOtherMessages();
    });

    it("handles single packages", () => {
        project.addJsonFile("tsconfig.json", {
            compilerOptions: {
                outDir: "dist",
                sourceMap: true,
                strict: true,
            },
            include: ["src"],
        });
        project.addJsonFile("package.json", {
            name: "typedoc-single-package",
            main: "dist/index.js",
        });
        project.addFile("dist/index.js", `//# sourceMappingURL=index.js.map`);
        project.addJsonFile("dist/index.js.map", {
            version: 3,
            file: "index.js",
            sourceRoot: "",
            sources: ["../src/index.ts"],
            names: [],
            mappings: "",
        });
        project.addFile(
            "src/index.ts",
            `export function helloWorld() { return "Hello World!"; }`
        );
        project.write();

        const logger = new TestLogger();
        const packages = expandPackages(logger, project.cwd, [project.cwd]);

        logger.expectNoOtherMessages();
        equal(packages, [normalizePath(project.cwd)]);
    });

    it("Handles TS 4.7 extensions", () => {
        project.addJsonFile("tsconfig.json", {
            compilerOptions: {
                outDir: "dist",
                sourceMap: true,
                strict: true,
            },
            include: ["src"],
        });
        project.addJsonFile("package.json", {
            name: "typedoc-single-package",
            main: "dist/index.cjs",
        });
        project.addFile("dist/index.cjs", `//# sourceMappingURL=index.cjs.map`);
        project.addJsonFile("dist/index.cjs.map", {
            version: 3,
            file: "index.cjs",
            sourceRoot: "",
            sources: ["../src/index.cts"],
            names: [],
            mappings: "",
        });
        project.addFile(
            "src/index.cts",
            `export function helloWorld() { return "Hello World!"; }`
        );
        project.write();

        const logger = new TestLogger();
        const packages = expandPackages(logger, project.cwd, [project.cwd]);

        logger.expectNoOtherMessages();
        equal(packages, [normalizePath(project.cwd)]);
    });
});
