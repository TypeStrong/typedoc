---
title: "@summary"
---

# @summary

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**JSDoc Reference:** [@summary](https://jsdoc.app/tags-summary)

When rendering modules, TypeDoc uses the first paragraph of comment's summary
text (text before any [block tags](../tags.md#block-tags)) as the member's
summary on the modules page. As this may not always be suitable for standalone
display, if a `@summary` tag is present TypeDoc will render that block instead.

If an `@summary` tag is not specified and `--useFirstParagraphOfCommentAsSummary` is
specified, TypeDoc will use the first paragraph of the comment as the short summary
to include on the modules page.

For overloaded functions, the `@summary` tag may be placed on the comment for the
first signature or on the comment for the function implementation.

## Example

```ts
/**
 * This description will be used on the **module** page if --useFirstParagraphOfCommentAsSummary is set
 * If not set, this function will not have a description on the module page.
 */
export function runProcess(): void;

/**
 * This description will be used on the **member** page
 * @summary
 * This description will be used on the **module** page
 */
export function forkProcess(): void;
```
