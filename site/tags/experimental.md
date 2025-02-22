---
title: "@experimental"
---

# @experimental

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@experimental](https://tsdoc.org/pages/tags/experimental/)

This tag can be used to indicate that the associated member is intended to eventually be used by third-party
developers but is not yet stable enough to conform to semantic versioning requirements.

The TSDoc specification indicates that the `@beta` and `@experimental` tags should be treated as semantically
equivalent. TypeDoc users should generally use one or the other, but not both.

## Example

```ts
export class Visibility {
    /** @experimental */
    newBehavior(): void;
}
```

## See Also

- The [`@alpha`](alpha.md) tag
- The [`@beta`](beta.md) tag
- The [`@public`](public.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
