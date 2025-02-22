import { deepStrictEqual as equal } from "assert/strict";
import { dedent } from "#utils";

describe("Dedent test helper", () => {
    it("Works on empty string", () => {
        equal(dedent(""), "");
    });

    it("Works with indented text", () => {
        equal(
            dedent(`
            Text here
        `),
            "Text here",
        );
    });

    it("Works with multiple lines", () => {
        equal(
            dedent(`
            Text here
                More indented
        `),
            "Text here\n    More indented",
        );
    });
});
