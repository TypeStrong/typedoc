import type { BuiltinTranslatableStringConstraints } from "./translatable.js";

export function buildTranslation<const T extends BuiltinTranslatableStringConstraints>(
    translations: T,
) {
    return translations;
}

export function buildIncompleteTranslation<
    const T extends Partial<BuiltinTranslatableStringConstraints>,
>(translations: T) {
    return translations;
}
