import { Project, tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Options, TSConfigReader } from "../../index";
import { getEntryPointsForPackage } from "../../lib/utils/package";
import { TestLogger } from "../TestLogger";

describe("getEntryPointsForPackage", () => {
    let fixture: Project;
    const logger = new TestLogger();
    let options: Options;

    const basePackage = {
        name: "x",
        version: "1.0",
    };

    function read() {
        fixture.write();
        options.read(logger);

        const entry = getEntryPointsForPackage(logger, options);
        logger.expectNoOtherMessages();
        return entry;
    }

    beforeEach(() => {
        fixture = tempdirProject();
        fixture.addJsonFile("tsconfig.json", {
            include: ["."],
        });

        options = new Options(logger);
        options.addReader(new TSConfigReader());
        options.setValue("tsconfig", fixture.cwd);
        options.setValue("entryPoints", [fixture.cwd]);
    });

    afterEach(() => {
        fixture.rm();
        logger.reset();
    });

    it("Handles a package with a ts entry point", () => {
        fixture.addFile("index.ts", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: "./index.ts",
        });

        const entry = read();
        ok(entry);
        equal(entry.packageName, "x");
        equal(entry.version, "1.0");
        equal(entry.entryPoints, [
            { name: "x", path: join(fixture.cwd, "index.ts") },
        ]);
    });

    it("Handles a package with a js entry point and allowJs", () => {
        fixture.addFile("index.js", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: "./index.js",
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                allowJs: true,
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "index.js") },
        ]);
    });

    it("Handles a package with a js entry point and checkJs", () => {
        fixture.addFile("index.js", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: "./index.js",
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                checkJs: true,
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "index.js") },
        ]);
    });

    it("Handles a package with a js entry point that can be mapped to a ts entry point with allowJs", () => {
        fixture.addFile("index.js", "export const a = 1");
        fixture.addFile("index.ts", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: "./index.js",
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                checkJs: true,
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "index.ts") },
        ]);
    });

    it("Handles a package with a js entry point and outDir", () => {
        fixture.addFile("dist/index.js", "export const a = 1");
        fixture.addFile("src/index.ts", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: "./dist/index.js",
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                outDir: "dist",
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "src/index.ts") },
        ]);
    });

    it("Handles a package with a js entry point and default conditional export", () => {
        fixture.addFile("dist/index.js", "export const a = 1");
        fixture.addFile("src/index.ts", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: {
                default: "./dist/index.js",
            },
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                outDir: "dist",
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "src/index.ts") },
        ]);
    });

    it("Handles a package with a js entry point and typedoc export", () => {
        fixture.addFile("dist/index.js", "export const a = 1");
        fixture.addFile("src/index.ts", "export const a = 1");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: {
                typedoc: "./src/index.ts",
                default: "./dist/index.js",
            },
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                outDir: "dist2", // note: Different to prove that typedoc export works
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "src/index.ts") },
        ]);
    });

    it("Handles multiple exports", () => {
        fixture.addFile("a.js", "export const a = 1");
        fixture.addFile("b.js", "export const b = 2");
        fixture.addJsonFile("package.json", {
            ...basePackage,
            exports: ["./a.js", "./b.js"],
        });
        fixture.addJsonFile("tsconfig.json", {
            compilerOptions: {
                outDir: "dist2", // note: Different to prove that typedoc export works
            },
            include: ["."],
        });

        const entry = read();
        equal(entry?.entryPoints, [
            { name: "x", path: join(fixture.cwd, "src/index.ts") },
        ]);
    });
});
