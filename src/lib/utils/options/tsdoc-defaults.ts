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
    "@author",
    "@callback",
    "@category",
    "@categoryDescription",
    "@default",
    "@document",
    "@group",
    "@groupDescription",
    "@import",
    "@inheritDoc",
    "@jsx",
    "@license",
    "@module",
    "@prop",
    "@property",
    "@return",
    "@satisfies",
    "@template", // Alias for @typeParam
    "@type", // Because TypeScript is important!
    "@typedef",
] as const;

export const tsdocInlineTags = ["@link", "@inheritDoc", "@label"] as const;
export const inlineTags = [
    ...tsdocInlineTags,
    "@linkcode",
    "@linkplain",
] as const;

export const tsdocModifierTags = [
    "@alpha",
    "@beta",
    "@eventProperty",
    "@experimental",
    "@internal",
    "@override",
    "@packageDocumentation",
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
    "@hideconstructor",
    "@hideGroups",
    "@ignore",
    "@interface",
    "@namespace",
    "@overload",
    "@private",
    "@protected",
    "@showCategories",
    "@showGroups",
] as const;
