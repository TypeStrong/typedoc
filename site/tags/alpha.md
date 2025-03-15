---
title: "@alpha"
---

# @alpha

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@alpha](https://tsdoc.org/pages/tags/alpha/)

This tag can be used to indicate that the associated member is intended
to eventually be used by third-party developers but is not yet stable
enough to conform to semantic versioning requirements.

## Example

```ts
export class Visibility {
    /** @alpha */
    newBehavior(): void;
}
```

## See Also

- The [`@beta`](beta.md) tag
- The [`@experimental`](experimental.md) tag
- The [`@public`](public.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
