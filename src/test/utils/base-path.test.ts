import { equal } from "assert";
import { BasePath } from "../../lib/converter/utils/base-path";

describe("BasePath.normalize", () => {
    const winTest = process.platform === "win32" ? it : it.skip;
    const nixTest = process.platform === "win32" ? it.skip : it;

    winTest("Returns paths with forward slashes", () => {
        equal(
            BasePath.normalize("test\\test\\another/forward"),
            "test/test/another/forward",
        );
    });

    winTest("Normalizes drive letters", () => {
        equal(BasePath.normalize("c:\\foo"), "C:/foo");
        equal(BasePath.normalize("D:/foo"), "D:/foo");
    });

    winTest("Checks for unix style paths", () => {
        equal(BasePath.normalize("/c/users/you"), "C:/users/you");
    });

    nixTest("Returns the original path", () => {
        equal(BasePath.normalize("/c/users\\foo"), "/c/users\\foo");
    });
});
