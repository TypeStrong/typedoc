import type {
    blockTags,
    inlineTags,
    modifierTags,
} from "../utils/options/tsdoc-defaults.js";
import translatable from "./locales/en.cjs";

export type BuiltinTranslatableStringArgs = {
    [K in keyof typeof translatable]: BuildTranslationArguments<
        (typeof translatable)[K]
    >;
} & Record<

        | (typeof blockTags)[number]
        | (typeof inlineTags)[number]
        | (typeof modifierTags)[number] extends `@${infer T}`
        ? `tag_${T}`
        : never,
    []
>;

type BuildTranslationArguments<
    T extends string,
    Acc extends any[] = [],
> = T extends `${string}{${bigint}}${infer R}`
    ? BuildTranslationArguments<R, [...Acc, string]>
    : Acc;

export type BuiltinTranslatableStringConstraints = {
    [K in keyof BuiltinTranslatableStringArgs]: TranslationConstraint[BuiltinTranslatableStringArgs[K]["length"]];
};

type BuildConstraint<
    T extends number,
    Acc extends string = "",
    U extends number = T,
> = [T] extends [never]
    ? `${Acc}${string}`
    : T extends T
      ? BuildConstraint<Exclude<U, T>, `${Acc}${string}{${T}}`>
      : never;

// Combinatorially explosive, but shouldn't matter for us, since we only need a few iterations.
type TranslationConstraint = [
    string,
    BuildConstraint<0>,
    BuildConstraint<0 | 1>,
    BuildConstraint<0 | 1 | 2>,
    BuildConstraint<0 | 1 | 2 | 3>,
];

// Compiler errors here which says a property is missing indicates that the value on translatable
// is not a literal string. It should be so that TypeDoc's placeholder replacement detection
// can validate that all placeholders have been specified.
({}) satisfies {
    [K in keyof typeof translatable as string extends (typeof translatable)[K]
        ? K
        : never]: never;
};

// Compiler errors here which says a property is missing indicates that the key on translatable
// contains a placeholder _0/_1, etc. but the value does not match the expected constraint.
translatable satisfies {
    [K in keyof typeof translatable]: K extends `${string}_1${string}`
        ? TranslationConstraint[2]
        : K extends `${string}_0${string}`
          ? TranslationConstraint[1]
          : TranslationConstraint[0];
};
