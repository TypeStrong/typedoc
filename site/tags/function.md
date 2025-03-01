---
title: "@function"
---

# @function

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

If a variable declaration is callable and does not have a type declaration,
TypeDoc may convert it as a function. Sometimes, even if a type declaration
is specified, it is desirable to convert a variable as if it was a function.

This tag will cause TypeDoc to convert the specified variable as a function
even if it has a type declaration. TypeDoc will still refuse to convert the
variable as a function if it contains construct signatures or does not contain
any call signatures.

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
```

## See Also

- The [`@namespace`](namespace.md) tag
- The [`@interface`](interface.md) tag
