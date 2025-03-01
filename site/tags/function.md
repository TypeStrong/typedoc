---
title: "@function"
---

# @function

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

If a variable declaration is callable (but not constructable), TypeDoc can
convert it as a function. TypeDoc will only automatically convert it as a function
if the variable's initializer is a function expression and the variable is not
explicitly typed.

TypeDoc can be instructed to convert a callable variable declaration as a function
with the `@function` tag. The `@function` tag will have no effect if the variable
it is placed on is not callable or is constructable.

## Example

```ts
export interface MultiCallSignature {
    (): string;
    (x: string): string;
}

// Documented as if it was a function with two overloads
/** @function */
export const Callable: MultiCallSignature = () => "";

// Documented as Callable2: MultiCallSignature
export const Callable2: MultiCallSignature = () => "";

// Documented as if it was a function
export const Callable3 = () => "";

// Documented as a variable
export const Callable4 = Object.assign(function () {
    return "";
}, {
    fnProp: "",
});

// Documented as if it was a function
/** @function */
export const Callable5 = Object.assign(function () {
    return "";
}, {
    fnProp: "",
});
```

## See Also

- The [`@namespace`](namespace.md) tag
- The [`@interface`](interface.md) tag
