---
title: "@ignore"
---

# @ignore

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

Reflections marked with the `@ignore` tag will be removed from the documentation.
It is equivalent to the `@hidden` tag.

## Example

```ts
export class Visibility {
    /** @ignore */
    newBehavior(): void;
}
```

## See Also

- The [`@hidden`](hidden.md) tag
- The [`@internal`](internal.md) tag
- The [JSDoc `@ignore`](https://jsdoc.app/tags-ignore.html) tag
