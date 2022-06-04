import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Application, EntryPointStrategy, TSConfigReader } from "../..";

const fixture = tempdirProject();
fixture.addJsonFile("tsconfig.json", {
    include: ["."],
});
fixture.addFile("index.ts", "export function fromIndex() {}");
fixture.addFile("extra.ts", "export function extra() {}");

describe("Entry Points", () => {
    beforeEach(() => {
        fixture.write();
    });

    afterEach(() => {
        fixture.rm();
    });

    const app = new Application();
    const tsconfig = join(fixture.cwd, "tsconfig.json");
    app.options.addReader(new TSConfigReader());

    it("Supports expanding existing paths", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            2,
            "There are two files, so both should be expanded"
        );
    });

    it("Supports expanding globs in paths", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [`${fixture.cwd}/*.ts`],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            2,
            "There are two files, so both should be expanded"
        );
    });

    it("Supports resolving directories", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Resolve,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            1,
            "entry-points/index.ts should have been the sole entry point"
        );
    });

    it("Supports resolving packages", () => {
        const root = join(__dirname, "../packages/multi-package");
        app.bootstrap({
            tsconfig: root,
            entryPoints: [root],
            entryPointStrategy: EntryPointStrategy.Packages,
        });

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(entryPoints.length, 3);
    });
});
