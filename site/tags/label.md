---
title: "\{\@label\}"
---

# {@label}

**Tag Kind:** [Inline](../tags.md#inline-tags) <br>
**TSDoc Reference:** [@label](https://tsdoc.org/pages/tags/label/)

The `@label` tag can be used to give an overloaded signature a name that it can be referenced
with via a [declaration reference](../declaration-references.md).

The identifier specified by the `@label` tag should contain only `A-Z`, `0-9`, and `_`, and should
not start with a number. If the identifier does not match this pattern, TypeDoc will be unable to
use it when referencing via a declaration reference.

## Example

```ts
/**
 * {@label BASE}
 */
export function round(x: number);
/**
 * {@label PRECISION}
 */
export function round(x: number, y: number);
export function round(x: number, y = 0) {
    // ...
}

/**
 * A value rounded with {@link round:PRECISION}
 */
export const rounded = round(123.456, 2);
```

## TSDoc Compatibility

While the `@label` tag is considered a core tag by TSDoc, its usage in the form of declaration references
supported by TypeDoc is not permitted. TypeDoc extends the declaration reference grammar to support it,
but users should be aware that this is non-standard. See [declaration references](../declaration-references.md)
for additional details.

## See Also

- The [`@link`](link.md) tag
- [Declaration references](../declaration-references.md) documentation
