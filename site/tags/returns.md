---
title: "@returns"
---

# @returns

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@returns](https://tsdoc.org/pages/tags/returns/)

The `@returns` tag can be used to document the return value of a function. At most one `@returns` tag should be present in a comment.

TypeDoc treats the `@return` tag as an alias for `@returns`.

## Example

```ts
/**
 * @param a - the first number
 * @param b - the second number
 * @returns The sum of `a` and `b`
 */
export function sum(a: number, b: number): number;
```

## See Also

- The [`@param`](param.md) tag
