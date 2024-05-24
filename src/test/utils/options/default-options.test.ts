import { ok, throws, strictEqual, doesNotThrow } from "assert";
import { Options } from "../../../lib/utils";
import { Internationalization } from "../../../lib/internationalization/internationalization";

describe("Default Options", () => {
    const opts = new Options(new Internationalization(null).proxy);

    describe("Highlighting theme", () => {
        it("Errors if an invalid theme is provided", () => {
            throws(() =>
                opts.setValue("lightHighlightTheme", "randomTheme" as never),
            );
            opts.setValue("lightHighlightTheme", "github-light");
            strictEqual(opts.getValue("lightHighlightTheme"), "github-light");

            throws(() =>
                opts.setValue("darkHighlightTheme", "randomTheme" as never),
            );
            opts.setValue("darkHighlightTheme", "github-light");
            strictEqual(opts.getValue("darkHighlightTheme"), "github-light");
        });
    });

    describe("sort", () => {
        it("Errors if an invalid sort version is provided", () => {
            throws(() =>
                opts.setValue("sort", ["random", "alphabetical"] as never),
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

    describe("markdownItOptions", () => {
        it("Errors if given a non-object", () => {
            throws(() => opts.setValue("markdownItOptions", null as never));
            throws(() => opts.setValue("markdownItOptions", "bad" as never));
            throws(() => opts.setValue("markdownItOptions", [] as never));
        });
    });

    describe("compilerOptions", () => {
        it("Errors if given a non-object", () => {
            throws(() => opts.setValue("compilerOptions", "bad"));
            throws(() => opts.setValue("compilerOptions", null));
            throws(() => opts.setValue("compilerOptions", []));
        });
    });

    describe("requiredToBeDocumented", () => {
        it("Works with valid values", () => {
            doesNotThrow(() =>
                opts.setValue("requiredToBeDocumented", ["Enum"]),
            );
        });

        it("Throws on invalid values", () => {
            throws(() =>
                opts.setValue("requiredToBeDocumented", ["Enum2" as never]),
            );
        });
    });

    describe("searchCategoryBoosts", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("searchCategoryBoosts", null as never));
        });

        it("Should disallow non-numbers", () => {
            throws(() =>
                opts.setValue("searchCategoryBoosts", {
                    cat: true as any as number,
                }),
            );
        });
    });

    describe("searchGroupBoosts", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("searchGroupBoosts", null as never));
        });

        it("Should disallow non-numbers", () => {
            throws(() =>
                opts.setValue("searchGroupBoosts", {
                    Enum: true as any as number,
                }),
            );
        });

        it("Should allow groups", () => {
            doesNotThrow(() => opts.setValue("searchGroupBoosts", { Enum: 5 }));
        });
    });

    describe("headerLinks", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("navigationLinks", null as never));
        });

        it("Should disallow non-strings", () => {
            throws(() =>
                opts.setValue("navigationLinks", {
                    Home: true as any as string,
                }),
            );
        });
    });

    describe("sidebarLinks", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("sidebarLinks", null as never));
        });

        it("Should disallow non-strings", () => {
            throws(() =>
                opts.setValue("sidebarLinks", {
                    Home: true as any as string,
                }),
            );
        });
    });
});
