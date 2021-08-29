import { deepStrictEqual as equal } from "assert";
import { isSupportedLanguage } from "../../lib/utils/highlighter";

describe("Language aliases", () => {
    describe("Original language aliases", () => {
        it("js is present", () => {
            equal(isSupportedLanguage("js"), true);
        });
        it("ts is present", () => {
            equal(isSupportedLanguage("ts"), true);
        });
        it("sh is present", () => {
            equal(isSupportedLanguage("sh"), true);
        });
        it("bash is present", () => {
            equal(isSupportedLanguage("bash"), true);
        });
        it("zsh is present", () => {
            equal(isSupportedLanguage("zsh"), true);
        });
        it("text is present", () => {
            equal(isSupportedLanguage("text"), true);
        });
    });

    // non-exhaustive, just shows that some of the uncovered ones are now covered
    describe("Extended language aliases", () => {
        it("rb is present", () => {
            equal(isSupportedLanguage("rb"), true);
        });
        it("py is present", () => {
            equal(isSupportedLanguage("py"), true);
        });
        it("jssm is present", () => {
            equal(isSupportedLanguage("jssm"), true);
        });
    });

    // non-exhaustive, just shows that the basic names are upheld too
    describe("Basic ids", () => {
        it("ruby is present", () => {
            equal(isSupportedLanguage("ruby"), true);
        });
        it("python is present", () => {
            equal(isSupportedLanguage("python"), true);
        });
        it("javascript is present", () => {
            equal(isSupportedLanguage("javascript"), true);
        });
        it("typescript is present", () => {
            equal(isSupportedLanguage("typescript"), true);
        });
        it("fsl is present", () => {
            equal(isSupportedLanguage("fsl"), true);
        });
    });

    describe("Improper language aliases", () => {
        it("js2 is not present", () => {
            equal(isSupportedLanguage("js2"), false);
        });
    });
});
