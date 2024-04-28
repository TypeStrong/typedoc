import { tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Application, EntryPointStrategy } from "../../index.js";

const fixture = tempdirProject();
fixture.addJsonFile("tsconfig.json", {
    include: ["."],
});
fixture.addJsonFile("package.json", {
    main: "index.ts",
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

    const tsconfig = join(fixture.cwd, "tsconfig.json");

    it("Supports expanding existing paths", async () => {
        const app = await Application.bootstrap({
            tsconfig,
            entryPoints: [fixture.cwd],
            entryPointStrategy: EntryPointStrategy.Expand,
        });

        const entryPoints = app.getEntryPoints();
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

        const entryPoints = app.getEntryPoints();
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

        const entryPoints = app.getEntryPoints();
        ok(entryPoints);
        equal(
            entryPoints.length,
            1,
            "entry-points/index.ts should have been the sole entry point",
        );
    });
});
