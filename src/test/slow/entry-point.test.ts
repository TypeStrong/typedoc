import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import { Application, EntryPointStrategy, TSConfigReader } from "../..";

const root = join(__dirname, "entry-points");

describe("Entry Points", () => {
    const app = new Application();
    const tsconfig = join(root, "tsconfig.json");
    app.options.addReader(new TSConfigReader());

    it("Supports expanding existing paths", () => {
        app.bootstrap({
            tsconfig,
            entryPoints: [root],
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
            entryPoints: [root],
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
