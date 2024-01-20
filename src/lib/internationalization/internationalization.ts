import type { Application } from "../application";
import { DefaultMap } from "../utils";
import { translatable, type BuiltinTranslatableStrings } from "./translatable";

/**
 * ### What is translatable?
 * TypeDoc includes a lot of literal strings. By convention, messages which are displayed
 * to the user at the INFO level or above should be present in this object to be available
 * for translation. Messages at the VERBOSE level need not be translated as they are primarily
 * intended for debugging.
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
 *         plugin_msg_1: [string];
 *     }
 * }
 * ```
 */
export interface TranslatableStrings extends BuiltinTranslatableStrings {}

/**
 * Dynamic proxy type built from {@link TranslatableStrings}
 */
export type TranslationProxy = {
    [K in keyof TranslatableStrings]: (
        ...args: TranslatableStrings[K]
    ) => string;
};

/**
 * Simple internationalization module which supports placeholders.
 * See {@link TranslatableStrings} for a description of how this module works and how
 * plugins should add translations.
 */
export class Internationalization {
    private allTranslations = new DefaultMap<string, Map<string, string>>(
        () => new Map(),
    );

    constructor(private application: Application) {}

    /**
     * Get the translation of the specified key, replacing placeholders
     * with the arguments specified.
     */
    translate<T extends keyof TranslatableStrings>(
        key: T,
        ...args: TranslatableStrings[T]
    ): string {
        return (
            this.allTranslations.getNoInsert(this.application.lang)?.get(key) ??
            translatable[key] ??
            key
        ).replace(/\{(\d+)\}/g, (_, index) => {
            return args[+index] ?? "(no placeholder)";
        });
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
     * Creates a proxy object which supports dynamically translating
     * all supported keys. This is generally used rather than the translate
     * method so that renaming a key on the `translatable` object that contains
     * all of the default translations will automatically update usage locations.
     */
    createProxy(): TranslationProxy {
        return new Proxy({} as TranslationProxy, {
            get: ({}, key) => {
                return (...args: string[]) =>
                    this.translate(key as never, ...(args as never));
            },
        });
    }
}
