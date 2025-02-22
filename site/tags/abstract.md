---
title: "@abstract"
---

# @abstract

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

This tag can be used to tell TypeDoc to document a method or property as
abstract, even though it is not according to TypeScript. It can be convenient if
a module may be used by JS consumers without type hints and you want to provide
a default implementation which throws with a more helpful error message.

## Example

```ts
export class AbstractExample {
    /** @abstract */
    requiredOverride(): void {
        throw new Error(
            "requiredOverride not implemented in subclass of AbstractExample",
        );
    }
}
```

## See Also

- The [`@public`](public.md) tag
- The [`--visibilityFilters`](../options/output.md#visibilityfilters) option
