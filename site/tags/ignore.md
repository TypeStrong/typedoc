---
title: "@ignore"
---

# @ignore

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

Reflections marked with the `@hidden` tag will be removed from the documentation.
It is equivalent to the `@ignore` JSDoc tag.

## Example

```ts
export class Visibility {
    /** @ignore */
    newBehavior(): void;
}
```

## See Also

- The [`@ignore`](ignore.md) tag
- The [`@internal`](internal.md) tag
- The [JSDoc `@ignore`](https://jsdoc.app/tags-ignore.html) tag
