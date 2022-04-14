/* Enum-like objects with string literal values */

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

/* Enum-like objects with numeric literal values */

export const SomeEnumLikeNumeric = {
    a: 0,
    b: 1,
} as const;

/** @enum */
export const SomeEnumLikeTaggedNumeric = {
    a: 0,
    b: 1,
} as const;

/** @enum */
export const ManualEnumNumeric: { readonly a: 0 } = {
    a: 0,
};

/** @enum */
export const ManualEnumHelperNumeric: Readonly<{ a: 0 }> = {
    a: 0,
};

/** @enum */
export const WithoutReadonlyNumeric = {
    a: 0,
} as { a: 0 };
