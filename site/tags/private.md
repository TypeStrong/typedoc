---
title: "@private"
---

# @private

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

This tag should generally not be used and may be removed in a future release.
The `@private` tag overrides the visibility of a reflection to be private.

## Example

```ts
export class Visibility {
    /** @private */
    member = 123;
}

// Will be documented as:
export class Visibility {
    private member = 123;
}
```

## See Also

- The [`@public`](public.md) tag
- The [`@protected`](protected.md) tag
- The [`@internal`](internal.md) tag
- The [`--excludePrivate`](../options/input.md#excludeprivate) option
