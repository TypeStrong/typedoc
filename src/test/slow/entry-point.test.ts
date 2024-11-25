import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Application, EntryPointStrategy } from "../../index.js";

describe("Entry Points", () => {
    using fixture = tempdirProject();
    const tsconfig = join(fixture.cwd, "tsconfig.json");

    beforeEach(() => {
        fixture.files.length = 0;
        fixture.addJsonFile("tsconfig.json", {
            include: ["."],
        });
        fixture.addJsonFile("package.json", {
            main: "index.ts",
        });
        fixture.addFile("index.ts", "export function fromIndex() {}");
        fixture.addFile("extra.ts", "export function extra() {}");
        fixture.write();
    });

    afterEach(() => {
        fixture.rm();
    });

    it("Supports expanding existing paths", async () => {
        const app = await Application.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getDefinedEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            2,
            "There are two files, so both should be expanded",
        );
    });

    it("Supports expanding globs in paths", async () => {
        const app = await Application.bootstrap({
            tsconfig,
            entryPoints: [`${fixture.cwd}/*.ts`],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getDefinedEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            2,
            "There are two files, so both should be expanded",
        );
    });

    it("Supports resolving directories", async () => {
        const app = await Application.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Resolve,
        });

        const entryPoints = app.getDefinedEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            1,
            "entry-points/index.ts should have been the sole entry point",
        );
    });
});
