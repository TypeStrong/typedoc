import { rm } from "fs/promises";
import { getConverter2App, getConverter2Project } from "../programs.js";
import { TestRouter, TestTheme } from "./testRendererUtils.js";
import { deepEqual as equal } from "assert/strict";
import { glob, readFile } from "#node-utils";
import type { GlobString, NormalizedPath } from "#utils";
import { join, relative } from "path";
import { resetReflectionID } from "#models";

const app = getConverter2App();

app.renderer.defineTheme("test-theme", TestTheme);
app.renderer.defineRouter("test-router", TestRouter);

describe("DefaultTheme", () => {
    afterEach(() => {
        app.options.reset();
    });

    it("Matches render snapshot", async function () {
        const SPEC_PATH = "src/test/renderer/specs" as NormalizedPath;
        const outPath = "tmp/renderer" as NormalizedPath;

        app.options.setValue("theme", "test-theme");
        app.options.setValue("router", "test-router");
        app.options.setValue("disableGit", true);
        app.options.setValue("sourceLinkTemplate", "{path}");

        resetReflectionID();
        const project = getConverter2Project(["renderer"], ".");
        project.readme = [{ kind: "text", text: "Readme text" }];
        await app.generateDocs(project, outPath);
        await rm(outPath + "/assets", { recursive: true });
        await rm(outPath + "/.nojekyll");

        const expectedFiles = glob("**/*" as GlobString, SPEC_PATH);
        const actualFiles = glob("**/*" as GlobString, outPath);
        const relPaths = expectedFiles.map(p => relative(SPEC_PATH, p)).sort();

        equal(
            actualFiles.map(p => relative(outPath, p)).sort(),
            relPaths,
        );

        for (const rel of relPaths) {
            const expected = JSON.parse(readFile(join(SPEC_PATH, rel)));
            const actual = JSON.parse(readFile(join(outPath, rel)));

            equal(actual, expected);
        }
    });
});
