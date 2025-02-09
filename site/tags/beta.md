---
title: "@beta"
---

# @beta

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@beta](https://tsdoc.org/pages/tags/beta/)

This tag can be used to indicate that the associated member is intended to eventually be used by third-party
developers but is not yet stable enough to conform to semantic versioning requirements.

The TSDoc specification indicates that the `@beta` and `@experimental` tags should be treated as semantically
equivalent. TypeDoc users should generally use one or the other, but not both.

## Example

```ts
export class Visibility {
    /** @beta */
    newBehavior(): void;
}
```

## See Also

- The [`@alpha`](alpha.md) tag
- The [`@experimental`](experimental.md) tag
- The [`@public`](public.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
