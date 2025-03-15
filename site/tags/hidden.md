---
title: "@hidden"
---

# @hidden

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

Reflections marked with the `@hidden` tag will be removed from the documentation.
It is equivalent to the `@ignore` JSDoc tag, which is also recognized by TypeDoc.

## Example

```ts
export class Visibility {
    /** @hidden */
    newBehavior(): void;
}
```

## See Also

- The [`@ignore`](ignore.md) tag
- The [`@internal`](internal.md) tag
