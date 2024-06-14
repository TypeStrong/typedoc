import { deepStrictEqual as equal } from "assert";
import { join } from "path";
import { normalizePath } from "../lib/utils";
import { expandPackages } from "../lib/utils/package-manifest";

import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { TestLogger } from "./TestLogger";
import { createMinimatch } from "../lib/utils/paths";

describe("Packages support", () => {
    using project = tempdirProject();

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
            "export function bar(): void;",
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

        // Bay, entry point with "typedoc.entryPoint"
        project.addFile("packages/bay/dist/index.js", "module.exports = 123");
        project.addFile("packages/bay/index.ts", "export function foo() {}");
        project.addJsonFile("packages/bay/package.json", {
            name: "typedoc-multi-package-bay",
            version: "1.0.0",
            main: "dist/index",
            typedoc: {
                entryPoint: "index.ts",
            },
        });
        project.addJsonFile("packages/bay/tsconfig.json", childTsconfig);

        // Ign, ignored package
        project.addFile("packages/ign/dist/index.js", "module.exports = 123");
        project.addFile("packages/ign/index.ts", "export function ign() {}");
        project.addJsonFile("packages/ign/package.json", {
            name: "typedoc-multi-package-ign",
            version: "1.0.0",
            main: "dist/index",
        });
        project.addJsonFile("packages/ign/tsconfig.json", childTsconfig);

        project.write();
        const logger = new TestLogger();
        const packages = expandPackages(
            logger,
            project.cwd,
            [project.cwd],
            createMinimatch(["**/ign"]),
        );

        equal(
            packages,
            [
                join(project.cwd, "packages/bar"),
                join(project.cwd, "packages/bay"),
                join(project.cwd, "packages/baz"),
            ].map(normalizePath),
        );

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
            `export function helloWorld() { return "Hello World!"; }`,
        );
        project.write();

        const logger = new TestLogger();
        const packages = expandPackages(logger, project.cwd, [project.cwd], []);

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
            `export function helloWorld() { return "Hello World!"; }`,
        );
        project.write();

        const logger = new TestLogger();
        const packages = expandPackages(logger, project.cwd, [project.cwd], []);

        logger.expectNoOtherMessages();
        equal(packages, [normalizePath(project.cwd)]);
    });
});
