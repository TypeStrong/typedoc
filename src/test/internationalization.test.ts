import { deepEqual as equal, ok } from "assert/strict";
import { Application } from "..";
import { readdirSync } from "fs";
import { join } from "path";

describe("Internationalization", () => {
    let app: Application;
    before(async () => {
        app = await Application.bootstrap({}, []);
    });

    afterEach(() => {
        app.options.reset();
    });

    it("Supports getting the list of supported languages", () => {
        equal(app.internationalization.getSupportedLanguages(), [
            "en",
            "ko",
            "test",
        ]);
    });

    it("Supports translating without placeholders", () => {
        equal(
            app.i18n.no_entry_points_to_merge(),
            "No entry points provided to merge",
        );
        app.options.setValue("lang", "test");
        equal(app.i18n.no_entry_points_to_merge(), "no_entry_points_to_merge");
    });

    it("Supports translating with placeholders", () => {
        equal(
            app.i18n.docs_generated_at_0("X"),
            "Documentation generated at X",
        );
        app.options.setValue("lang", "test");
        equal(app.i18n.docs_generated_at_0("X"), "docs_generated_at_0 X");
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
        });
    }
});
