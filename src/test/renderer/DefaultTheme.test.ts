import { buildRendererSpecs } from "./testRendererUtils.js";
import { deepEqual as equal } from "assert/strict";
import { glob, readFile } from "#node-utils";
import type { GlobString, NormalizedPath } from "#utils";
import { join, relative } from "path";

describe("DefaultTheme", () => {
    it("Matches render snapshot", async function () {
        const SPEC_PATH = "src/test/renderer/specs" as NormalizedPath;
        const outPath = "tmp/renderer" as NormalizedPath;

        await buildRendererSpecs(outPath);

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
