import { deepStrictEqual as equal, doesNotThrow, throws } from "assert/strict";
import { assert, assertNever, dedent } from "#utils";

describe("general.ts", () => {
    it("dedent works on empty string", () => {
        equal(dedent(""), "");
    });

    it("dedent works with indented text", () => {
        equal(
            dedent(`
                Text here
            `),
            "Text here",
        );
    });

    it("dedent works with multiple lines", () => {
        equal(
            dedent(`
                Text here
                    More indented
            `),
            "Text here\n    More indented",
        );
    });

    it("assertNever", () => {
        throws(
            () => assertNever("x" as never),
            new Error(`Expected handling to cover all possible cases, but it didn't cover: "x"`),
        );
    });

    it("assert", () => {
        doesNotThrow(() => assert(true));
        throws(() => assert(false), new Error("Assertion failed"));
    });
});
