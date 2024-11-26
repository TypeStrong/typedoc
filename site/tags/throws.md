---
title: "@throws"
---

# @throws

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@throws](https://tsdoc.org/pages/tags/throws/)

The `@throws` tag can be used to document an exception that can be thrown by a function or method.

## Example

```ts
/**
 * @throws {@link UserError} if `max < min`
 */
export function rand(min: number, max: number): number;
```
