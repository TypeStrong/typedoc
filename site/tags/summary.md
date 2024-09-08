---
title: "@summary"
---

# @summary

**Tag Kind:** [Block](../tags.md#Block-Tags) <br>
**JSDoc Reference:** [@summary](https://jsdoc.app/tags-summary)

When rendering modules, TypeDoc uses the first paragraph of comment's summary
text (text before any [block tags](../tags.md#Block-Tags)) as the member's
summary on the modules page. As this may not always be suitable for standalone
display, if a `@summary` tag is present TypeDoc will render that block instead.

## Example

```ts
/**
 * This description will be used on the **module** page
 */
export function runProcess(): void;

/**
 * This description will be used on the **member** page
 * @summary
 * This description will be used on the **module** page
 */
export function forkProcess(): void;
```
