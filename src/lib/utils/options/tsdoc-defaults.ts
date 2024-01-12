// If updating these lists, also see .config/typedoc-default.tsdoc.json

export const tsdocBlockTags = [
    "@deprecated",
    "@param",
    "@remarks",
    "@returns",
    "@throws",
    "@privateRemarks",
    "@defaultValue",
    "@typeParam",
] as const;

export const blockTags = [
    ...tsdocBlockTags,
    "@module",
    "@inheritDoc",
    "@group",
    "@category",
    // Alias for @typeParam
    "@template",
    // Because TypeScript is important!
    "@type",
    "@typedef",
    "@callback",
    "@prop",
    "@property",
    "@satisfies",
] as const;

export const tsdocInlineTags = ["@link", "@inheritDoc", "@label"] as const;
export const inlineTags = [...tsdocInlineTags, "@linkcode", "@linkplain"];

export const tsdocModifierTags = [
    "@public",
    "@private",
    "@protected",
    "@internal",
    "@readonly",
    "@packageDocumentation",
    "@eventProperty",
    "@alpha",
    "@beta",
    "@experimental",
    "@sealed",
    "@override",
    "@virtual",
] as const;

export const modifierTags = [
    ...tsdocModifierTags,
    "@hidden",
    "@ignore",
    "@class",
    "@enum",
    "@event",
    "@overload",
    "@namespace",
    "@interface",
    "@showCategories",
    "@hideCategories",
    "@showGroups",
    "@hideGroups",
] as const;
