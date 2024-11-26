---
title: "@author"
---

# @author

**Tag Kind:** [Block](../tags.md#block-tags)

The `@author` tag can be used to document the the author of a method. TypeDoc
attaches no behavior to this tag, rendering it as a paragraph within the
generated comment.

## Example

```ts
/**
 * @author John Smith
 */
export function rand(min: number, max: number): number;
```
