---
title: "@group"
---

# @group

**Tag Kind:** [Block](../tags.md#Block-Tags)

The `@group` tag can be used to place several related API items under a common header when
listed in a page's index. It may be specified multiple times to list a reflection under several
headings.

Unlike the [`@category`](category.md) tag, reflections will be automatically placed under
a header according to their kind if the `@group` tag is not specified. This tag can be used to
simulate custom member types.

## Example

```ts
export class App extends EventEmitter {
    /**
     * @group Events
     */
    static readonly BEGIN = "begin";

    /**
     * The `@event` tag is equivalent to `@group Events`
     * @event
     */
    static readonly PARSE_OPTIONS = "parseOptions";

    /**
     * The `@eventProperty` tag is equivalent to `@group Events`
     * @eventProperty
     */
    static readonly END = "end";
}
```

## Navigation Customization

Groups can be added to the navigation tree with the `navigation.includeGroups`
option. This can be selectively enabled or disabled by specifying
the `@showGroups` and `@hideGroups` modifier tags within
the comment on the parent reflection.

## See Also

-   The [`@category`](category.md) tag
-   The [`@groupDescription`](groupDescription.md) tag
-   The [`--searchGroupBoosts`](../options/output.md#searchGroupBoosts) option
-   The [`--navigation.includeGroups`](../options/output.md#navigation) option
