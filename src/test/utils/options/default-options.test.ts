import { ok, throws, strictEqual } from "assert";
import { BUNDLED_THEMES, Theme } from "shiki";
import { Logger, Options } from "../../../lib/utils";

describe("Default Options", () => {
    const opts = new Options(new Logger());
    opts.addDefaultDeclarations();

    describe("highlightTheme", () => {
        it("Errors if an invalid theme is provided", () => {
            // @ts-expect-error setValue should require a valid theme.
            throws(() => opts.setValue("highlightTheme", "randomTheme"));
            opts.setValue("highlightTheme", BUNDLED_THEMES[0] as Theme);
            strictEqual(opts.getValue("highlightTheme"), BUNDLED_THEMES[0]);
        });
    });

    describe("sort", () => {
        it("Errors if an invalid sort version is provided", () => {
            // @ts-expect-error setValue should require a valid sort version.
            throws(() => opts.setValue("sort", ["random", "alphabetical"]));
        });

        it("Reports which sort option(s) was invalid", () => {
            try {
                // @ts-expect-error setValue should require a valid sort version.
                opts.setValue("sort", ["random", "alphabetical", "foo"]);
            } catch (e) {
                ok(e.message.includes("random"));
                ok(e.message.includes("foo"));
            }
        });
    });
});
