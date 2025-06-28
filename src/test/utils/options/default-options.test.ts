import { deepStrictEqual as equal, doesNotThrow, ok, throws } from "assert";
import { Options, TYPEDOC_ROOT } from "../../../lib/utils/index.js";
import { readFileSync } from "fs";
import { rootPackageOptions } from "../../../lib/utils/options/declaration.js";

describe("Default Options", () => {
    const opts = new Options();

    describe("Highlighting theme", () => {
        it("Errors if an invalid theme is provided", () => {
            throws(() => opts.setValue("lightHighlightTheme", "randomTheme" as never));
            opts.setValue("lightHighlightTheme", "github-light");
            equal(opts.getValue("lightHighlightTheme"), "github-light");

            throws(() => opts.setValue("darkHighlightTheme", "randomTheme" as never));
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
            throws(() => opts.setValue("sort", ["random", "alphabetical"] as never));
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
            doesNotThrow(() => opts.setValue("requiredToBeDocumented", ["Enum"]));
        });

        it("Throws on invalid values", () => {
            throws(() => opts.setValue("requiredToBeDocumented", ["Enum2" as never]));
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
                })
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
                })
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
                })
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
                })
            );
        });
    });

    describe("locales", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("locales", null as never));
        });

        it("Should disallow objects containing non-objects", () => {
            throws(() => opts.setValue("locales", { test: false } as never));
        });

        it("Should disallow locales containing non-strings", () => {
            throws(() => opts.setValue("locales", { test: { key: false } } as never));
        });

        it("Should allow valid locale shapes", () => {
            doesNotThrow(() => opts.setValue("locales", { test: { key: "hi" } }));
        });
    });

    describe("packageOptions", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("packageOptions", null as never));
        });

        it("Should allow objects", () => {
            doesNotThrow(() => opts.setValue("packageOptions", { test: false } as never));
        });
    });

    describe("blockTags", () => {
        it("Should disallow non-tags", () => {
            throws(() => opts.setValue("blockTags", ["@bad-non-tag"]));
        });

        it("Should allow tags", () => {
            doesNotThrow(() => opts.setValue("blockTags", ["@good"]));
        });
    });

    describe("excludeNotDocumentedKinds", () => {
        it("Should disallow invalid kind strings", () => {
            throws(() => opts.setValue("excludeNotDocumentedKinds", ["InvalidKind"] as never));
        });

        it("Should disallow disallowed kind strings", () => {
            throws(() => opts.setValue("excludeNotDocumentedKinds", ["Project"] as never));
        });

        it("Should kinds", () => {
            doesNotThrow(() => opts.setValue("excludeNotDocumentedKinds", ["Variable"]));
        });
    });

    describe("externalSymbolLinkMappings", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("externalSymbolLinkMappings", null as never));
        });

        it("Should disallow objects containing non-objects", () => {
            throws(() => opts.setValue("externalSymbolLinkMappings", { test: false } as never));
        });

        it("Should disallow mappings containing non-strings", () => {
            throws(() => opts.setValue("externalSymbolLinkMappings", { test: { key: false } } as never));
        });

        it("Should allow valid mapping shapes", () => {
            doesNotThrow(() => opts.setValue("externalSymbolLinkMappings", { test: { key: "hi" } }));
        });
    });

    describe("outputs", () => {
        it("Should disallow non-arrays", () => {
            throws(() => opts.setValue("outputs", null as never));
        });

        it("Should arrays of invalid shape", () => {
            throws(() => opts.setValue("outputs", [{}] as never));
        });

        it("Should allow valid shapes", () => {
            doesNotThrow(() => opts.setValue("outputs", [{ name: "html", path: "out" }]));
        });
    });

    describe("highlightLanguages", () => {
        it("Should disallow non-arrays", () => {
            throws(() => opts.setValue("highlightLanguages", null as never));
        });

        it("Should disallow arrays containing unknown languages", () => {
            throws(() => opts.setValue("highlightLanguages", ["notASupportedLanguage"] as never));
        });

        it("Should allow valid languages", () => {
            doesNotThrow(() => opts.setValue("highlightLanguages", ["typescript"]));
        });
    });

    describe("markdownItLoader", () => {
        it("Should disallow non-functions", () => {
            throws(() => opts.setValue("markdownItLoader", null as never));
        });

        it("Should allow functions", () => {
            doesNotThrow(() => opts.setValue("markdownItLoader", () => {}));
        });
    });

    describe("favicon", () => {
        it("Should disallow paths with an unknown extension", () => {
            throws(() => opts.setValue("favicon", "test.txt"));
        });

        it("Should allow remote paths with an unknown extension", () => {
            doesNotThrow(() => opts.setValue("favicon", "https://example.com/test.txt"));
        });

        it("Should allow paths with a known extension", () => {
            doesNotThrow(() => opts.setValue("favicon", "test.png"));
        });
    });

    describe("hostedBaseurl", () => {
        it("Should disallow non-http urls", () => {
            throws(() => opts.setValue("hostedBaseUrl", "test"));
            throws(() => opts.setValue("hostedBaseUrl", "ftp://test"));
        });

        it("Should allow http and https urls", () => {
            doesNotThrow(() => opts.setValue("hostedBaseUrl", "http://example.com/"));
            doesNotThrow(() => opts.setValue("hostedBaseUrl", "https://example.com/"));
        });
    });

    describe("visibilityFilters", () => {
        it("Should disallow non-objects", () => {
            throws(() => opts.setValue("visibilityFilters", "test" as never));
        });

        it("Should disallow objects with an invalid key", () => {
            throws(() => opts.setValue("visibilityFilters", { bad: true } as never));
        });

        it("Should disallow objects with a non-boolean values", () => {
            throws(() => opts.setValue("visibilityFilters", { private: "bad" } as never));
        });

        it("Should allow objects with a valid shape", () => {
            doesNotThrow(() => opts.setValue("visibilityFilters", { private: true }));
            doesNotThrow(() => opts.setValue("visibilityFilters", { "@test": true }));
        });
    });

    describe("kindSortOrder", () => {
        it("Should disallow non-kind strings", () => {
            throws(() => opts.setValue("kindSortOrder", ["Bad"] as never));
        });
        it("Should allow valid sort orders", () => {
            doesNotThrow(() => opts.setValue("kindSortOrder", ["Accessor"]));
        });
    });

    it("Package Options Documentation", () => {
        const allOptions = opts
            .getDeclarations()
            .map((opt) => opt.name)
            .sort((a, b) => a.localeCompare(b));

        const linkedOptions: string[] = [];
        for (
            const line of readFileSync(
                `${TYPEDOC_ROOT}/site/options/package-options.md`,
                "utf-8",
            ).split("\n")
        ) {
            const match = line.match(/\[`(.*?)`\]\(/);
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

    it("Root package option documentation matches", () => {
        const rootOptions: string[] = [];
        for (
            const line of readFileSync(
                `${TYPEDOC_ROOT}/site/options/package-options.md`,
                "utf-8",
            ).split("\n")
        ) {
            const match = line.match(/\[`(.*?)`\]\(.*?\)\s*\| Root/);
            if (match) {
                rootOptions.push(match[1]);
            }
        }

        equal(
            rootOptions,
            rootPackageOptions,
            "Documented root options to not match internal list of root options",
        );
    });

    it("Option documentation", () => {
        const allOptions = opts
            .getDeclarations()
            .map((opt) => opt.name)
            .sort((a, b) => a.localeCompare(b));

        const documentedOptions: string[] = [];
        for (
            const file of [
                "comments.md",
                "configuration.md",
                "input.md",
                "organization.md",
                "other.md",
                "output.md",
                "validation.md",
            ]
        ) {
            for (
                const line of readFileSync(
                    `${TYPEDOC_ROOT}/site/options/${file}`,
                    "utf-8",
                ).split("\n")
            ) {
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
