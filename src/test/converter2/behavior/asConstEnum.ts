export const SomeEnumLike = {
    a: "a",
    b: "b",
} as const;

/** @enum */
export const SomeEnumLikeTagged = {
    a: "a",
    b: "b",
} as const;

/** @enum */
export const ManualEnum: { readonly a: "a" } = {
    a: "a",
};

/** @enum */
export const ManualEnumHelper: Readonly<{ a: "a" }> = {
    a: "a",
};

/** @enum */
export const WithoutReadonly = {
    a: "a",
} as { a: "a" };
