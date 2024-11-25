---
title: "@class"
---

# @class

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

If present on a variable, will cause it to be converted as a class. This
will result in all "dynamic" properties being expanded to real properties.

TypeDoc will also ignore types/interfaces declared with the same name as
variables annotated with `@class`.

## Example

```ts
/** @class */
export function ClassLike() {
    if (new.target) {
        //
    }
}
```

## See Also

-   The [`@interface`](interface.md) tag
