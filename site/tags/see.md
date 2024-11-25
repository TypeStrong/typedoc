---
title: "@see"
---

# @see

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@see](https://tsdoc.org/pages/tags/see/)
**JSDoc Reference:** [@see](https://jsdoc.app/tags-see)

The `@see` tag can be used to create a list of references for other resources related to this export.

## Example

```ts
/**
 * @see [Factorial - Wikipedia](https://en.wikipedia.org/wiki/Factorial)
 * @see {@link semifactorial}
 */
export function factorial(n: number): number;
```

## JSDoc Compatibility

JSDoc specifies that `@see` tags contents will be parsed as a reference to a symbol
name if possible. TypeDoc does not support this use case, requiring an explicit `@link`
within the comment if a link is desired.
