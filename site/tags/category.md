---
title: "@category"
---

# @category

**Tag Kind:** [Block](../tags.md#block-tags)

The `@category` tag can be used to place several related API items under a
common header when listed in a page's index. It may be specified multiple times
to list a reflection under several headings.

## Example

```ts
/**
 * @categoryDescription Advanced Use
 * These functions are available for...
 * @showCategories
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

## Category Descriptions

The `@categoryDescription` block tag can be used to provide additional context
about a category of reflections which was created with the
`@category` tag.

The `@categoryDescription` tag should be placed in the comment for the
reflection which contains the child reflections marked with `@category`.

The first line of the `@categoryDescription` will be taken as the category name,
and following lines will be used for the description.

## Navigation Customization

Categories can be added to the navigation tree with the
`navigation.includeCategories` option. This can be selectively enabled or
disabled by specifying the `@showCategories` and `@hideCategories` modifier tags
within the comment on the parent reflection.

## See Also

- The [`@group`](group.md) tag
- The [`--categorizeByGroup`](../options/organization.md#categorizebygroup) option
- The [`--defaultCategory`](../options/organization.md#defaultcategory) option
- The [`--categoryOrder`](../options/organization.md#categoryorder) option
- The [`--searchCategoryBoosts`](../options/output.md#searchcategoryboosts) option
- The [`--navigation.includeCategories`](../options/output.md#navigation) option
