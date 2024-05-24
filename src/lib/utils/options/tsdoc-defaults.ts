// If updating these lists, also update tsdoc.json

export const tsdocBlockTags = [
    "@defaultValue",
    "@deprecated",
    "@example",
    "@param",
    "@privateRemarks",
    "@remarks",
    "@returns",
    "@see",
    "@throws",
    "@typeParam",
] as const;

export const blockTags = [
    ...tsdocBlockTags,
    "@category",
    "@categoryDescription",
    "@default",
    "@document",
    "@group",
    "@groupDescription",
    "@inheritDoc",
    "@license",
    "@module",
    "@return",
    // Alias for @typeParam
    "@template",
    // Because TypeScript is important!
    "@type",
    "@typedef",
    "@callback",
    "@prop",
    "@property",
    "@satisfies",
    "@import",
] as const;

export const tsdocInlineTags = ["@link", "@inheritDoc", "@label"] as const;
export const inlineTags = [...tsdocInlineTags, "@linkcode", "@linkplain"];

export const tsdocModifierTags = [
    "@alpha",
    "@beta",
    "@eventProperty",
    "@experimental",
    "@internal",
    "@override",
    "@packageDocumentation",
    "@private",
    "@protected",
    "@public",
    "@readonly",
    "@sealed",
    "@virtual",
] as const;

export const modifierTags = [
    ...tsdocModifierTags,
    "@class",
    "@enum",
    "@event",
    "@hidden",
    "@hideCategories",
    "@hideGroups",
    "@ignore",
    "@interface",
    "@namespace",
    "@overload",
    "@showCategories",
    "@showGroups",
    "@hideconstructor",
] as const;
