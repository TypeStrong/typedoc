import { ok } from "assert";
import type { Application } from "../application";
import { DefaultMap, unique } from "../utils";
import {
    translatable,
    type BuiltinTranslatableStringArgs,
} from "./translatable";
import { readdirSync } from "fs";
import { join } from "path";
import { ReflectionKind } from "../models/reflections/kind";
import { ReflectionFlag } from "../models";

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

declare const TranslatedString: unique symbol;
export type TranslatedString = string & { [TranslatedString]: true };

/**
 * Dynamic proxy type built from {@link TranslatableStrings}
 */
export type TranslationProxy = {
    [K in keyof TranslatableStrings]: (
        ...args: TranslatableStrings[K]
    ) => TranslatedString;
};

// If we're running in ts-node, then we need the TS source rather than
// the compiled file.
const ext = process[Symbol.for("ts-node.register.instance") as never]
    ? "cts"
    : "cjs";

/**
 * Simple internationalization module which supports placeholders.
 * See {@link TranslatableStrings} for a description of how this module works and how
 * plugins should add translations.
 */
export class Internationalization {
    private allTranslations = new DefaultMap<string, Map<string, string>>(
        (lang) => {
            // Make sure this isn't abused to load some random file by mistake
            ok(
                /^[A-Za-z-]+$/.test(lang),
                "Locale names may only contain letters and dashes",
            );
            try {
                return new Map(
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    Object.entries(require(`./locales/${lang}.${ext}`)),
                );
            } catch {
                return new Map();
            }
        },
    );

    /**
     * Proxy object which supports dynamically translating
     * all supported keys. This is generally used rather than the translate
     * method so that renaming a key on the `translatable` object that contains
     * all of the default translations will automatically update usage locations.
     */
    proxy: TranslationProxy = new Proxy(this, {
        get(internationalization, key) {
            return (...args: string[]) =>
                internationalization.translate(
                    key as never,
                    ...(args as never),
                );
        },
    }) as never as TranslationProxy;

    /**
     * If constructed without an application, will use the default language.
     * Intended for use in unit tests only.
     * @internal
     */
    constructor(private application: Application | null) {}

    /**
     * Get the translation of the specified key, replacing placeholders
     * with the arguments specified.
     */
    translate<T extends keyof typeof translatable>(
        key: T,
        ...args: TranslatableStrings[T]
    ): TranslatedString {
        return (
            this.allTranslations.get(this.application?.lang ?? "en").get(key) ??
            translatable[key]
        ).replace(/\{(\d+)\}/g, (_, index) => {
            return args[+index] ?? "(no placeholder)";
        }) as TranslatedString;
    }

    kindSingularString(kind: ReflectionKind): TranslatedString {
        switch (kind) {
            case ReflectionKind.Project:
                return this.proxy.kind_project();
            case ReflectionKind.Module:
                return this.proxy.kind_module();
            case ReflectionKind.Namespace:
                return this.proxy.kind_namespace();
            case ReflectionKind.Enum:
                return this.proxy.kind_enum();
            case ReflectionKind.EnumMember:
                return this.proxy.kind_enum_member();
            case ReflectionKind.Variable:
                return this.proxy.kind_variable();
            case ReflectionKind.Function:
                return this.proxy.kind_function();
            case ReflectionKind.Class:
                return this.proxy.kind_class();
            case ReflectionKind.Interface:
                return this.proxy.kind_interface();
            case ReflectionKind.Constructor:
                return this.proxy.kind_constructor();
            case ReflectionKind.Property:
                return this.proxy.kind_property();
            case ReflectionKind.Method:
                return this.proxy.kind_method();
            case ReflectionKind.CallSignature:
                return this.proxy.kind_call_signature();
            case ReflectionKind.IndexSignature:
                return this.proxy.kind_index_signature();
            case ReflectionKind.ConstructorSignature:
                return this.proxy.kind_constructor_signature();
            case ReflectionKind.Parameter:
                return this.proxy.kind_parameter();
            case ReflectionKind.TypeLiteral:
                return this.proxy.kind_type_literal();
            case ReflectionKind.TypeParameter:
                return this.proxy.kind_type_parameter();
            case ReflectionKind.Accessor:
                return this.proxy.kind_accessor();
            case ReflectionKind.GetSignature:
                return this.proxy.kind_get_signature();
            case ReflectionKind.SetSignature:
                return this.proxy.kind_set_signature();
            case ReflectionKind.TypeAlias:
                return this.proxy.kind_type_alias();
            case ReflectionKind.Reference:
                return this.proxy.kind_reference();
            case ReflectionKind.Document:
                return this.proxy.kind_document();
        }
    }

    kindPluralString(kind: ReflectionKind): TranslatedString {
        switch (kind) {
            case ReflectionKind.Project:
                return this.proxy.kind_plural_project();
            case ReflectionKind.Module:
                return this.proxy.kind_plural_module();
            case ReflectionKind.Namespace:
                return this.proxy.kind_plural_namespace();
            case ReflectionKind.Enum:
                return this.proxy.kind_plural_enum();
            case ReflectionKind.EnumMember:
                return this.proxy.kind_plural_enum_member();
            case ReflectionKind.Variable:
                return this.proxy.kind_plural_variable();
            case ReflectionKind.Function:
                return this.proxy.kind_plural_function();
            case ReflectionKind.Class:
                return this.proxy.kind_plural_class();
            case ReflectionKind.Interface:
                return this.proxy.kind_plural_interface();
            case ReflectionKind.Constructor:
                return this.proxy.kind_plural_constructor();
            case ReflectionKind.Property:
                return this.proxy.kind_plural_property();
            case ReflectionKind.Method:
                return this.proxy.kind_plural_method();
            case ReflectionKind.CallSignature:
                return this.proxy.kind_plural_call_signature();
            case ReflectionKind.IndexSignature:
                return this.proxy.kind_plural_index_signature();
            case ReflectionKind.ConstructorSignature:
                return this.proxy.kind_plural_constructor_signature();
            case ReflectionKind.Parameter:
                return this.proxy.kind_plural_parameter();
            case ReflectionKind.TypeLiteral:
                return this.proxy.kind_plural_type_literal();
            case ReflectionKind.TypeParameter:
                return this.proxy.kind_plural_type_parameter();
            case ReflectionKind.Accessor:
                return this.proxy.kind_plural_accessor();
            case ReflectionKind.GetSignature:
                return this.proxy.kind_plural_get_signature();
            case ReflectionKind.SetSignature:
                return this.proxy.kind_plural_set_signature();
            case ReflectionKind.TypeAlias:
                return this.proxy.kind_plural_type_alias();
            case ReflectionKind.Reference:
                return this.proxy.kind_plural_reference();
            case ReflectionKind.Document:
                return this.proxy.kind_plural_document();
        }
    }

    flagString(flag: ReflectionFlag): TranslatedString {
        switch (flag) {
            case ReflectionFlag.None:
                throw new Error("Should be unreachable");
            case ReflectionFlag.Private:
                return this.proxy.flag_private();
            case ReflectionFlag.Protected:
                return this.proxy.flag_protected();
            case ReflectionFlag.Public:
                return this.proxy.flag_public();
            case ReflectionFlag.Static:
                return this.proxy.flag_static();
            case ReflectionFlag.External:
                return this.proxy.flag_external();
            case ReflectionFlag.Optional:
                return this.proxy.flag_optional();
            case ReflectionFlag.Rest:
                return this.proxy.flag_rest();
            case ReflectionFlag.Abstract:
                return this.proxy.flag_abstract();
            case ReflectionFlag.Const:
                return this.proxy.flag_const();
            case ReflectionFlag.Readonly:
                return this.proxy.flag_readonly();
            case ReflectionFlag.Inherited:
                return this.proxy.flag_inherited();
        }
    }

    translateTagName(tag: `@${string}`): TranslatedString {
        const tagName = tag.substring(1);
        const translations = this.allTranslations.get(
            this.application?.lang ?? "en",
        );
        if (translations.has(`tag_${tagName}`)) {
            return translations.get(`tag_${tagName}`) as TranslatedString;
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
            ...readdirSync(join(__dirname, "locales")).map((x) =>
                x.substring(0, x.indexOf(".")),
            ),
            ...this.allTranslations.keys(),
        ]).sort();
    }
}
