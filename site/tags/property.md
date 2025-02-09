---
title: "@property"
---

# @property

**Tag Kind:** [Block](../tags.md#block-tags)

The `@property` (or `@prop`) tag can be used to add a comment to a child of the current reflection.
It is intended for use with the [`@namespace`](namespace.md) and [`@interface`](interface.md) tags
which might not have convenient places to include comments for each member.

## Example

```ts
/**
 * This will be displayed as an interface
 * @property a comment for a
 * @prop b comment for b
 * @interface
 */
export type Resolved = Record<"a" | "b" | "c", string>;

// will be documented as if you wrote

/** This will be displayed as an interface */
export interface Resolved {
    /** comment for a */
    a: string;
    /** comment for b */
    b: string;
    c: string;
}
```

## See Also

- The [`@namespace`](namespace.md) tag
- The [`@interface`](interface.md) tag
