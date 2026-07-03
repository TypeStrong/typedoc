import { addTranslations, DefaultMap, setTranslations, type TranslatedString } from "#utils";
import { type BuiltinTranslatableStringArgs } from "./translatable.js";

import de from "./locales/de.js";
import en from "./locales/en.js";
import fr from "./locales/fr.js";
import ja from "./locales/ja.js";
import ko from "./locales/ko.js";
import zh from "./locales/zh.js";

const translations = new Map<string, Record<string, string>>([
    ["de", de],
    ["en", en],
    ["fr", fr],
    ["ja", ja],
    ["ko", ko],
    ["zh", zh],
]);

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
 * Responsible for maintaining loaded internationalized strings.
 */
export class Internationalization {
    private locales = new DefaultMap<string, Record<string, string>>(() => ({}));
    private loadedLocale!: string;

    constructor() {
        this.setLocale("en");
    }

    setLocale(locale: string): void {
        if (this.loadedLocale !== locale) {
            const defaultTranslations = translations.get(locale) || translations.get("en") || {};
            const overrides = this.locales.get(locale);
            setTranslations({ ...defaultTranslations, ...overrides });
            this.loadedLocale = locale;
        }
    }

    addTranslations(locale: string, translations: Record<string, string>): void {
        Object.assign(this.locales.get(locale), translations);
        if (locale === this.loadedLocale) {
            addTranslations(translations);
        }
    }

    hasTranslations(locale: string) {
        return this.getSupportedLanguages().includes(locale);
    }

    getSupportedLanguages(): string[] {
        const supported = new Set(translations.keys());
        for (const [locale, translations] of this.locales) {
            if (Object.entries(translations).length) {
                supported.add(locale);
            }
        }
        return Array.from(supported);
    }
}
