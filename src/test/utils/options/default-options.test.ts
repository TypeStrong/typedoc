import { ok, throws, strictEqual } from "assert";
import { BUNDLED_THEMES, Theme } from "shiki";
import { Logger, Options } from "../../../lib/utils";

describe("Default Options", () => {
    const opts = new Options(new Logger());
    opts.addDefaultDeclarations();

    describe("highlightTheme", () => {
        it("Errors if an invalid theme is provided", () => {
            throws(() =>
                opts.setValue("highlightTheme", "randomTheme" as never)
            );
            opts.setValue("highlightTheme", BUNDLED_THEMES[0] as Theme);
            strictEqual(opts.getValue("highlightTheme"), BUNDLED_THEMES[0]);
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
