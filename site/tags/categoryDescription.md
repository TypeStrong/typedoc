---
title: "@categoryDescription"
---

# @categoryDescription

**Tag Kind:** [Block](../tags.md#block-tags)

The `@categoryDescription` tag can be used to provide additional context about a category of reflections
which was created with the [`@category`](category.md) tag.

The `@categoryDescription` tag should be placed in the comment for the reflection which contains the
child reflections marked with `@category`.

The first line of the `@categoryDescription` will be taken as the category name, and following lines will
be used for the description.

## Example

```ts
/**
 * @categoryDescription Advanced Use
 * These functions are available for...
 * @module
 */

/**
 * @category General Use
 */
export function runProcess(): void;

/**
 * @category Advanced Use
 */
export function unref(): void;

/**
 * @category Advanced Use
 */
export function ref(): void;
```

## See Also

-   The [`@category`](category.md) tag
-   The [`@group`](group.md) tag
-   The [`@module`](module.md) tag
-   The [`--categorizeByGroup`](../options/organization.md#categorizebygroup) option
-   The [`--defaultCategory`](../options/organization.md#defaultcategory) option
-   The [`--categoryOrder`](../options/organization.md#categoryorder) option
-   The [`--searchCategoryBoosts`](../options/output.md#searchcategoryboosts) option
