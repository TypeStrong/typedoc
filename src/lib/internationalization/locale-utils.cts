import type { BuiltinTranslatableStringConstraints } from "./translatable.js" with { "resolution-mode": "import" };

function buildTranslation<T extends BuiltinTranslatableStringConstraints>(
    translations: T,
) {
    return translations;
}

function buildIncompleteTranslation<
    T extends Partial<BuiltinTranslatableStringConstraints>,
>(translations: T) {
    return translations;
}

export = { buildTranslation, buildIncompleteTranslation };
