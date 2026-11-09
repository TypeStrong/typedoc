import { deepStrictEqual as equal } from "assert";
import { addInferredDeclarationMapPaths, resolveDeclarationMaps } from "../../lib/utils/declaration-maps.js";
import { normalizePath } from "#node-utils";

describe("declaration-maps.ts", () => {
    const winTest = process.platform === "win32" ? it : it.skip;

    it("resolves declaration map paths when queried with normalized paths", () => {
        const sourceFile = normalizePath("/project/src/index.ts");
        addInferredDeclarationMapPaths(
            { rootDir: normalizePath("/project/src"), outDir: normalizePath("/project/dist") },
            [sourceFile],
        );

        const dtsFile = normalizePath("/project/dist/index.d.ts");
        equal(resolveDeclarationMaps(dtsFile), sourceFile);
    });

    winTest("resolves declaration map paths when queried with backslash Windows paths (#3146)", () => {
        const sourceFile = normalizePath("C:/app/src/entry.ts");
        addInferredDeclarationMapPaths(
            { rootDir: normalizePath("C:/app/src"), outDir: normalizePath("C:/app/dist") },
            [sourceFile],
        );

        // Windows-style backslashes in lookup path
        const winDtsFile = "C:\\app\\dist\\entry.d.ts";
        equal(resolveDeclarationMaps(winDtsFile), sourceFile);
    });

    it("returns non-declaration files unchanged", () => {
        equal(resolveDeclarationMaps("src/index.ts"), "src/index.ts");
        equal(resolveDeclarationMaps("dist/index.js"), "dist/index.js");
    });
});
