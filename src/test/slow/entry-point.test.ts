import { type Project, tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Application, EntryPointStrategy } from "../..";

describe("Entry Points", () => {
    let fixture: Project;
    let tsconfig: string;

    beforeEach(() => {
        fixture = tempdirProject();
        tsconfig = join(fixture.cwd, "tsconfig.json");

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
