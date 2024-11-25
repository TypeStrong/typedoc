---
title: "@example"
---

# @example

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@example](https://tsdoc.org/pages/tags/example/)

The example tag indicates that the following text is an example of how to use the function.

## Example

````ts
/**
 * Takes the factorial of `n`.
 *
 * @example
 * // If there are no code blocks, TypeDoc assumes the whole tag
 * // should be a code block. This is not valid TSDoc, but is recognized
 * // by VSCode and enables better JSDoc support.
 * factorial(1)
 *
 * @example
 * If there is a code block, then both TypeDoc and VSCode will treat
 * text outside of the code block as regular text.
 * ```ts
 * factorial(1)
 * ```
 */
export function factorial(n: number): number;
````
