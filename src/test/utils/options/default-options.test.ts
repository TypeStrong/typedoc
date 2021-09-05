import { ok, throws, strictEqual } from "assert";
import { BUNDLED_THEMES } from "shiki";
import { Logger, Options } from "../../../lib/utils";

describe("Default Options", () => {
    const opts = new Options(new Logger());
    opts.addDefaultDeclarations();

    describe("Highlighting theme", () => {
        it("Errors if an invalid theme is provided", () => {
            throws(() =>
                opts.setValue("lightHighlightTheme", "randomTheme" as never)
            );
            opts.setValue("lightHighlightTheme", BUNDLED_THEMES[0]);
            strictEqual(
                opts.getValue("lightHighlightTheme"),
                BUNDLED_THEMES[0]
            );

            throws(() =>
                opts.setValue("darkHighlightTheme", "randomTheme" as never)
            );
            opts.setValue("darkHighlightTheme", BUNDLED_THEMES[0]);
            strictEqual(opts.getValue("darkHighlightTheme"), BUNDLED_THEMES[0]);
        });
    });

    describe("sort", () => {
        it("Errors if an invalid sort version is provided", () => {
            throws(() =>
                opts.setValue("sort", ["random", "alphabetical"] as never)
            );
        });

        it("Reports which sort option(s) was invalid", () => {
            try {
                opts.setValue("sort", [
                    "random",
                    "alphabetical",
                    "foo",
                ] as never);
            } catch (e) {
                ok(e instanceof Error);
                ok(e.message.includes("random"));
                ok(e.message.includes("foo"));
            }
        });
    });
});
