---
title: "@category"
---

# @category

**Tag Kind:** [Block](../tags.md#Block-Tags)

The `@category` tag can be used to place several related API items under a common header when
listed in a page's index. It may be specified multiple times to list a reflection under several
headings.

## Example

```ts
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

## Navigation Customization

Categories can be added to the navigation tree with the `navigation.includeCategories`
option. This can be selectively enabled or disabled by specifying
the `@showCategories` and `@hideCategories` modifier tags within
the comment on the parent reflection.

## See Also

-   The [`@group`](group.md) tag
-   The [`@categoryDescription`](categoryDescription.md) tag
-   The [`--categorizeByGroup`](../options/organization.md#categorizeByGroup) option
-   The [`--defaultCategory`](../options/organization.md#defaultCategory) option
-   The [`--categoryOrder`](../options/organization.md#categoryOrder) option
-   The [`--searchCategoryBoosts`](../options/output.md#searchCategoryBoosts) option
-   The [`--navigation.includeCategories`](../options/output.md#navigation) option
