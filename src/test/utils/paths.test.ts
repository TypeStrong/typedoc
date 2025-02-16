import { deepStrictEqual as equal } from "assert";
import { createGlobString, getCommonDirectory, normalizePath, splitGlobToPathAndSpecial } from "#node-utils";
import type { NormalizedPath } from "#utils";

describe("paths.ts", () => {
    describe("splitGlobToPathAndSpecial", () => {
        it("Returns the entire glob as path if there are no special parts", () => {
            equal(splitGlobToPathAndSpecial(""), { modifiers: "", path: "", glob: "" });
            equal(splitGlobToPathAndSpecial("src/test.ts"), { modifiers: "", path: "src/test.ts", glob: "" });
        });

        it("Splits the glob based on stars", () => {
            equal(splitGlobToPathAndSpecial("src/*.test.ts"), { modifiers: "", path: "src", glob: "*.test.ts" });
            equal(splitGlobToPathAndSpecial("*.test.ts"), { modifiers: "", path: "", glob: "*.test.ts" });
        });

        it("Splits the glob based on brackets", () => {
            equal(splitGlobToPathAndSpecial("src/[ui]/*.test.ts"), {
                modifiers: "",
                path: "src",
                glob: "[ui]/*.test.ts",
            });
        });

        it("Handles globs with brace expansion", () => {
            equal(splitGlobToPathAndSpecial("{a,b}/*.ts"), { modifiers: "", path: "", glob: "{a,b}/*.ts" });
        });

        it("Handles commented globs", () => {
            equal(splitGlobToPathAndSpecial("#{a,b}/*.ts"), { modifiers: "#", path: "", glob: "{a,b}/*.ts" });
            equal(splitGlobToPathAndSpecial("#src/*.ts"), { modifiers: "#", path: "src", glob: "*.ts" });
            equal(splitGlobToPathAndSpecial("#src/index.ts"), { modifiers: "#", path: "src/index.ts", glob: "" });
        });

        it("Handles escaped glob parts", () => {
            equal(splitGlobToPathAndSpecial("src/\\[ui\\]/*.ts"), {
                modifiers: "",
                path: "src/[ui]",
                glob: "*.ts",
            });

            equal(splitGlobToPathAndSpecial("src/\\[ui]/*.ts"), {
                modifiers: "",
                path: "src/[ui]",
                glob: "*.ts",
            });
        });

        it("Handles escaped glob parts with braces", () => {
            equal(splitGlobToPathAndSpecial("src/{\\[ui\\],abc}/*.ts"), {
                modifiers: "",
                path: "src",
                glob: "{\\[ui\\]/*.ts,abc/*.ts}",
            });
        });
    });

    describe("createGlobString", () => {
        it("Handles global globs", () => {
            equal(createGlobString("/d/test/typedoc" as NormalizedPath, "**/abc/*.ts"), "**/abc/*.ts");
        });

        it("Handles negated global globs", () => {
            equal(createGlobString("/d/test/typedoc" as NormalizedPath, "!**/abc/*.ts"), "!**/abc/*.ts");
        });

        it("Handles commented global globs", () => {
            equal(createGlobString("/d/test/typedoc" as NormalizedPath, "#**/abc/*.ts"), "#**/abc/*.ts");
        });

        it("Handles file paths", () => {
            equal(
                createGlobString("/test/typedoc" as NormalizedPath, "src/index.ts"),
                "/test/typedoc/src/index.ts",
            );
        });
    });

    describe("getCommonDirectory", () => {
        it("Returns the empty string if no files are provided", () => {
            equal(getCommonDirectory([]), "");
        });

        it("Returns the dirname if only one file is provided", () => {
            equal(getCommonDirectory(["a/b/c.ts"]), "a/b");
        });

        it("Handles duplicates paths appropriately", () => {
            const p = "a/b/c";
            equal(getCommonDirectory([p, p]), p);
        });

        it("Gets the path common to all files", () => {
            equal(
                getCommonDirectory(["/a/b/c", "/a/b/c/d/e", "/a/b/d"]),
                "/a/b",
            );
        });

        it("Does not respect Windows path separator, #2825", () => {
            equal(getCommonDirectory(["/a/b\\]/c", "/a/b\\]/d"]), "/a/b\\]");
        });
    });

    describe("normalizePath", () => {
        const winTest = process.platform === "win32" ? it : it.skip;
        const nixTest = process.platform === "win32" ? it.skip : it;

        winTest("Returns paths with forward slashes", () => {
            equal(
                normalizePath("test\\test\\another/forward"),
                "test/test/another/forward",
            );
        });

        winTest("Normalizes drive letters", () => {
            equal(normalizePath("c:\\foo"), "C:/foo");
            equal(normalizePath("D:/foo"), "D:/foo");
        });

        winTest("Checks for unix style paths", () => {
            equal(normalizePath("/c/users/you"), "C:/users/you");
        });

        nixTest("Returns the original path", () => {
            equal(normalizePath("/c/users\\foo"), "/c/users\\foo");
        });
    });
});
