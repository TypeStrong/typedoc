import { ok, strictEqual } from "assert";
import * as Path from "path";

import * as td from "..";
import { Logger } from "../lib/utils";
import { expandPackages } from "../lib/utils/package-manifest";

describe("Packages support", () => {
    it("handles monorepos", () => {
        const base = Path.join(__dirname, "packages", "ts-monorepo");
        const app = new td.Application();
        app.options.addReader(new td.TypeDocReader());
        app.bootstrap({
            options: Path.join(base, "typedoc.json"),
        });
        const project = app.convert();
        ok(project, "Failed to convert");
        const result = app.serializer.projectToObject(project);
        ok(result.children !== undefined);
        strictEqual(
            result.children.length,
            4,
            "incorrect number of packages processed"
        );
    });

    it("handles single packages", () => {
        const base = Path.join(
            __dirname,
            "packages",
            "typedoc-single-package-example"
        );
        const app = new td.Application();
        app.options.addReader(new td.TypeDocReader());
        app.bootstrap({
            options: Path.join(base, "typedoc.json"),
        });
        const project = app.convert();
        ok(project, "Failed to convert");
        const result = app.serializer.projectToObject(project);
        ok(result.children !== undefined);
        strictEqual(
            result.children.length,
            1,
            "incorrect number of packages processed"
        );
    });

    describe("expandPackages", () => {
        it("handles a glob", () => {
            const base = Path.join(__dirname, "packages", "ts-monorepo");
            const expandedPackages = expandPackages(new Logger(), base, [
                "packages/*",
            ]);
            strictEqual(
                expandedPackages.length,
                3,
                "Found an unexpected number of packages"
            );
        });
    });
});
