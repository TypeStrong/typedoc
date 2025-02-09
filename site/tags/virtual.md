---
title: "@virtual"
---

# @virtual

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@virtual](https://tsdoc.org/pages/tags/virtual/)

TypeDoc parses the `@virtual` tag for compatibility with TSDoc, but does not attach any meaning to it's use.

## Example

```ts
export class Visibility {
    /** @virtual */
    intendedForOverrideByChildren(): void;
}
```

## See Also

- The [`@sealed`](sealed.md) tag
- The [`@override`](override.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
