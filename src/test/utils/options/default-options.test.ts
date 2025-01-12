import { ok, throws, deepStrictEqual as equal, doesNotThrow } from "assert";
import { Options, TYPEDOC_ROOT } from "../../../lib/utils/index.js";
import { Internationalization } from "../../../lib/internationalization/internationalization.js";
import { readFileSync } from "fs";

describe("Default Options", () => {
    const opts = new Options(new Internationalization(null).proxy);

    describe("Highlighting theme", () => {
        it("Errors if an invalid theme is provided", () => {
            throws(() =>
                opts.setValue("lightHighlightTheme", "randomTheme" as never),
            );
            opts.setValue("lightHighlightTheme", "github-light");
            equal(opts.getValue("lightHighlightTheme"), "github-light");

            throws(() =>
                opts.setValue("darkHighlightTheme", "randomTheme" as never),
            );
            opts.setValue("darkHighlightTheme", "github-light");
            equal(opts.getValue("darkHighlightTheme"), "github-light");
        });
    });

    describe("highlightLanguages", () => {
        it("Supports aliased languages", () => {
            opts.setValue("highlightLanguages", ["bash"]);
            equal(opts.getValue("highlightLanguages"), ["bash"]);
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

    it("Package Options Documentation", () => {
        const allOptions = opts
            .getDeclarations()
            .map((opt) => opt.name)
            .sort((a, b) => a.localeCompare(b));

        const linkedOptions: string[] = [];
        for (const line of readFileSync(
            `${TYPEDOC_ROOT}/site/options/package-options.md`,
            "utf-8",
        ).split("\n")) {
            const match = line.match(/\[`(.*)`\]\(/);
            if (match) {
                linkedOptions.push(match[1]);
            }
        }

        linkedOptions.sort((a, b) => a.localeCompare(b));

        equal(
            linkedOptions,
            allOptions,
            "Option added but not documented in package-options.md",
        );
    });

    it("Option documentation", () => {
        const allOptions = opts
            .getDeclarations()
            .map((opt) => opt.name)
            .sort((a, b) => a.localeCompare(b));

        const documentedOptions: string[] = [];
        for (const file of [
            "comments.md",
            "configuration.md",
            "input.md",
            "organization.md",
            "other.md",
            "output.md",
            "validation.md",
        ]) {
            for (const line of readFileSync(
                `${TYPEDOC_ROOT}/site/options/${file}`,
                "utf-8",
            ).split("\n")) {
                const match = line.match(/^## (.*)/);
                if (match) {
                    documentedOptions.push(match[1]);
                }
            }
        }

        documentedOptions.sort((a, b) => a.localeCompare(b));

        equal(
            documentedOptions,
            allOptions,
            "Option added but not documented in site/options/",
        );
    });
});
