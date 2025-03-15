---
title: "@namespace"
---

# @namespace

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@namespace` tag can be used to tell TypeDoc to convert a variable as a namespace. This will cause
any properties to be resolved and documented as exported variables/functions.

## Example

```ts
const a = 1;
const b = () => 2;
const c = { a, b, c: 3 };
/** @namespace */
export const d = { ...c, d: 4 };

// will be documented as if you wrote

export namespace d {
    export const a = 1;
    export const b = () => 2;
    export const c = 3;
    export const d = 4;
}
```

## See Also

- The [`@property`](property.md) tag
- The [`@interface`](interface.md) tag
