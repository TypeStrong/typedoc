---
title: "@override"
---

# @override

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@override](https://tsdoc.org/pages/tags/override/)

TypeDoc parses the `@override` tag for compatibility with TSDoc, but does not attach any meaning to it's use.

## Example

```ts
export class Visibility {
    /** @override */
    newBehavior(): void;
}
```

## See Also

- The [`@sealed`](sealed.md) tag
- The [`@virtual`](virtual.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
