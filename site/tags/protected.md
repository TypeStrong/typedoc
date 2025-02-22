---
title: "@protected"
---

# @protected

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

This tag should generally not be used and may be removed in a future release.
The `@protected` tag overrides the visibility of a reflection to be protected.

## Example

```ts
export class Visibility {
    /** @protected */
    member = 123;
}

// Will be documented as:
export class Visibility {
    protected member = 123;
}
```

## See Also

- The [`@public`](public.md) tag
- The [`@private`](private.md) tag
- The [`@internal`](internal.md) tag
- The [`--excludeProtected`](../options/input.md#excludeprotected) option
