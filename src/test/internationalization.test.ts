import { deepEqual as equal, ok } from "assert/strict";
import { Application } from "..";
import { readdirSync } from "fs";
import { join } from "path";
import { translatable } from "../lib/internationalization/translatable";
import { setDifference } from "../lib/utils/set";
import {
    blockTags,
    inlineTags,
    modifierTags,
} from "../lib/utils/options/tsdoc-defaults";

const allValidTranslationKeys = Object.keys(translatable);
// The tag names do not actually exist in the default locale, but are valid
// for translation, so include them here.
allValidTranslationKeys.push(...blockTags.map((s) => "tag_" + s.substring(1)));
allValidTranslationKeys.push(
    ...modifierTags.map((s) => "tag_" + s.substring(1)),
);
allValidTranslationKeys.push(...inlineTags.map((s) => "tag_" + s.substring(1)));

describe("Internationalization", () => {
    let app: Application;
    before(async () => {
        app = await Application.bootstrap({}, []);
    });

    afterEach(() => {
        app.options.reset();
    });

    it("Supports getting the list of supported languages", () => {
        const langs = app.internationalization.getSupportedLanguages();
        ok(langs.includes("en"));
        ok(langs.includes("ko"));
        ok(langs.includes("jp"));
    });

    it("Supports translating without placeholders", () => {
        equal(
            app.i18n.no_entry_points_to_merge(),
            "No entry points provided to merge",
        );
        app.options.setValue("lang", "zh");
        equal(app.i18n.no_entry_points_to_merge(), "没有提供合并的入口点");
    });

    it("Supports translating with placeholders", () => {
        equal(
            app.i18n.docs_generated_at_0("X"),
            "Documentation generated at X",
        );
        app.options.setValue("lang", "zh");
        equal(app.i18n.docs_generated_at_0("X"), "文档生成于 X");
    });
});

describe("Locales", () => {
    const localeRoot = join(__dirname, "../lib/internationalization/locales");

    for (const locale of readdirSync(localeRoot)) {
        it(`${locale} defines a valid locale`, () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const translations = require(join(localeRoot, locale)) as Record<
                string,
                string
            >;

            for (const [key, translation] of Object.entries(translations)) {
                const validPlaceholders = Array.from(
                    key.matchAll(/_(\d+)_|(\d+)$/g),
                    (m) => m[1] || m[2],
                );

                for (const placeholder of translation.matchAll(/\{(\d+?)\}/g)) {
                    ok(
                        validPlaceholders.includes(placeholder[1]),
                        `${key} translation references "${placeholder[0]}" which will not be available at runtime.`,
                    );
                }
            }

            const extraKeys = Array.from(
                setDifference(
                    Object.keys(translations),
                    allValidTranslationKeys,
                ),
            );
            equal(
                extraKeys,
                [],
                `${locale} defines translations which do not exist in the default locale.`,
            );
        });
    }
});
