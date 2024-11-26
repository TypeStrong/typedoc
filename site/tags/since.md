---
title: "@since"
---

# @since

**Tag Kind:** [Block](../tags.md#block-tags)

The `@since` tag can be used to document the version that a method was
introduced. TypeDoc attaches no behavior to this tag, rendering it as a
paragraph within the generated comment.

## Example

```ts
/**
 * @since Introduced in v1.2.3
 */
export function rand(min: number, max: number): number;
```
