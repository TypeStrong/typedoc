import { deepStrictEqual as equal } from "assert";
import { resolve } from "path";
import { addInferredDeclarationMapPaths, resolveDeclarationMaps } from "../../lib/utils/declaration-maps.js";
import { normalizePath } from "#node-utils";

describe("declaration-maps.ts", () => {
    const winTest = process.platform === "win32" ? it : it.skip;

    it("resolves declaration map paths when queried with normalized paths", () => {
        const rootDir = normalizePath(resolve("test-proj/src"));
        const outDir = normalizePath(resolve("test-proj/dist"));
        const sourceFile = normalizePath(resolve("test-proj/src/index.ts"));

        addInferredDeclarationMapPaths(
            { rootDir, outDir },
            [sourceFile],
        );

        const dtsFile = normalizePath(resolve("test-proj/dist/index.d.ts"));
        equal(resolveDeclarationMaps(dtsFile), sourceFile);
    });

    winTest("resolves declaration map paths when queried with backslash Windows paths (#3146)", () => {
        const rootDir = normalizePath(resolve("test-proj-win/src"));
        const outDir = normalizePath(resolve("test-proj-win/dist"));
        const sourceFile = normalizePath(resolve("test-proj-win/src/entry.ts"));

        addInferredDeclarationMapPaths(
            { rootDir, outDir },
            [sourceFile],
        );

        const dtsFile = normalizePath(resolve("test-proj-win/dist/entry.d.ts"));
        const winDtsFile = dtsFile.replace(/\//g, "\\");
        equal(resolveDeclarationMaps(winDtsFile), sourceFile);
    });

    it("returns non-declaration files unchanged", () => {
        equal(resolveDeclarationMaps("src/index.ts"), "src/index.ts");
        equal(resolveDeclarationMaps("dist/index.js"), "dist/index.js");
    });
});
