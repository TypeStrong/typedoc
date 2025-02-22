import { ok } from "assert";
import type { Application } from "../application.js";
import { DefaultMap, setTranslations, type TranslatedString, unique } from "#utils";
import { readdirSync } from "fs";
import { join } from "path";
import translatable from "./locales/en.cjs";
import { type BuiltinTranslatableStringArgs } from "./translatable.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

/**
 * ### What is translatable?
 * TypeDoc includes a lot of literal strings. By convention, messages which are displayed
 * to the user at the INFO level or above should be present in this object to be available
 * for translation. Messages at the VERBOSE level need not be translated as they are primarily
 * intended for debugging. ERROR/WARNING deprecation messages related to TypeDoc's API, or
 * requesting users submit a bug report need not be translated.
 *
 * Errors thrown by TypeDoc are generally *not* considered translatable as they are not
 * displayed to the user. An exception to this is errors thrown by the `validate` method
 * on options, as option readers will use them to report errors to the user.
 *
 * ### Interface Keys
 * This object uses a similar convention as TypeScript, where the specified key should
 * indicate where placeholders are present by including a number in the name. This is
 * so that translations can easily tell that they are including the appropriate placeholders.
 * This will also be validated at runtime by the {@link Internationalization} class, but
 * it's better to have that hint when editing as well.
 *
 * This interface defines the available translatable strings, and the number of placeholders
 * that are required to use each string. Plugins may use declaration merging to add members
 * to this interface to use TypeDoc's internationalization module.
 *
 * @example
 * ```ts
 * declare module "typedoc" {
 *     interface TranslatableStrings {
 *         // Define a translatable string with no arguments
 *         plugin_msg: [];
 *         // Define a translatable string requiring one argument
 *         plugin_msg_0: [string];
 *     }
 * }
 * ```
 */
export interface TranslatableStrings extends BuiltinTranslatableStringArgs {}

/**
 * Dynamic proxy type built from {@link TranslatableStrings}
 */
export type TranslationProxy = {
    [K in keyof TranslatableStrings]: (
        ...args: TranslatableStrings[K]
    ) => TranslatedString;
};

/**
 * Simple internationalization module which supports placeholders.
 * See {@link TranslatableStrings} for a description of how this module works and how
 * plugins should add translations.
 */
export class Internationalization {
    private allTranslations = new DefaultMap<string, Map<string, string>>(
        (lang) => {
            const req = createRequire(fileURLToPath(import.meta.url));
            // Make sure this isn't abused to load some random file by mistake
            ok(
                /^[A-Za-z-]+$/.test(lang),
                "Locale names may only contain letters and dashes",
            );
            try {
                return new Map(Object.entries(req(`./locales/${lang}.cjs`)));
            } catch {
                return new Map();
            }
        },
    );

    /**
     * If constructed without an application, will use the default language.
     * Intended for use in unit tests only.
     * @internal
     */
    constructor(private application: Application | null) {
        // TODO: Get rid of this extra proxy
        setTranslations(
            new Proxy(this, {
                get(i, p) {
                    const t = i.allTranslations.get(i.application?.lang ?? "en") ??
                        translatable;
                    return t instanceof Map ? t.get(p as string) : t[p];
                },
                has(i, p) {
                    const t = i.allTranslations.get(i.application?.lang ?? "en") ??
                        translatable;
                    return t instanceof Map ? t.has(p as string) : Object.prototype.hasOwnProperty.call(t, p);
                },
            }) as never,
        );
    }

    /**
     * Add translations for a string which will be displayed to the user.
     */
    addTranslations(
        lang: string,
        translations: Partial<Record<keyof TranslatableStrings, string>>,
        override = false,
    ): void {
        const target = this.allTranslations.get(lang);
        for (const [key, val] of Object.entries(translations)) {
            if (!target.has(key) || override) {
                target.set(key, val);
            }
        }
    }

    /**
     * Checks if we have any translations in the specified language.
     */
    hasTranslations(lang: string): boolean {
        return this.allTranslations.get(lang).size > 0;
    }

    /**
     * Gets a list of all languages with at least one translation.
     */
    getSupportedLanguages(): string[] {
        return unique([
            ...readdirSync(
                join(fileURLToPath(import.meta.url), "../locales"),
            ).map((x) => x.substring(0, x.indexOf("."))),
            ...this.allTranslations.keys(),
        ])
            .filter((lang) => this.hasTranslations(lang))
            .sort();
    }
}
