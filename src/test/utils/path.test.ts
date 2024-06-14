import { equal } from "assert";
import { normalizePath } from "../../lib/utils";

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
