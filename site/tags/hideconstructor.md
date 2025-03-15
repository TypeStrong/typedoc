---
title: "@hideconstructor"
---

# @hideconstructor

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

This tag should only be used to work around [TypeScript#58653](https://github.com/microsoft/TypeScript/issues/58653).
Prefer the [`@hidden`](hidden.md) or [`@ignore`](ignore.md) tags instead.

Classes marked with `@hideconstructor` will have their constructor hidden, it may also be placed on constructors to
remove them from the documentation

## Example

```ts
/** @hideconstructor */
export class Visibility {
    /** Will not be present in the generated documentation */
    constructor() {}
}
```

## See Also

- The [`@hidden`](hidden.md) tag
- The [`@ignore`](ignore.md) tag
