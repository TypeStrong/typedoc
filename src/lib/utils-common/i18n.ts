// Type only import to non-bundled file
// eslint-disable-next-line no-restricted-imports
import type { TranslationProxy } from "../internationalization/internationalization.js";

let translations: Record<PropertyKey, string> = {};

declare const TranslatedString: unique symbol;
export type TranslatedString = string & { [TranslatedString]: true };

/**
 * Set the available translations to be used by TypeDoc.
 */
export function setTranslations(t: Record<string, string>) {
    translations = t;
}

export const i18n = new Proxy({}, {
    get(_, key) {
        return (...args: string[]) => {
            const template = String(translations[key] || key);
            return template.replace(/\{(\d+)\}/g, (_, index) => {
                return args[+index] ?? "(no placeholder)";
            });
        };
    },
    has(_, key) {
        return Object.prototype.hasOwnProperty.call(translations, key);
    },
}) as TranslationProxy;

export function translateTagName(tag: `@${string}`): TranslatedString {
    const tagName = tag.substring(1);
    if (Object.prototype.hasOwnProperty.call(translations, `tag_${tagName}`)) {
        return translations[`tag_${tagName}`] as TranslatedString;
    }
    // In English, the tag names are the translated names, once turned
    // into title case.
    return (tagName.substring(0, 1).toUpperCase() +
        tagName
            .substring(1)
            .replace(
                /[a-z][A-Z]/g,
                (x) => `${x[0]} ${x[1]}`,
            )) as TranslatedString;
}
