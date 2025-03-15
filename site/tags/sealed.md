---
title: "@sealed"
---

# @sealed

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@sealed](https://tsdoc.org/pages/tags/sealed/)

TypeDoc parses the `@sealed` tag for compatibility with TSDoc, but does not attach any meaning to it's use.

## Example

```ts
export class Visibility {
    /** @sealed */
    newBehavior(): void;
}
```

## See Also

- The [`@virtual`](virtual.md) tag
- The [`@override`](override.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
