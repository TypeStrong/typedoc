---
title: "@interface"
---

# @interface

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

If present on a type alias, will cause it to be converted as an interface. This
will result in all "dynamic" properties being expanded to real properties.

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

- The [`@property`](property.md) tag
- The [`@namespace`](namespace.md) tag
- The [`@useDeclaredType`](useDeclaredType.md) tag
