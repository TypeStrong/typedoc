---
title: "@group"
---

# Group Tags

The `@group`, `@groupDescription`, `@showGroups`, `@hideGroups`, and
`@disableGroups` tags can be used to control how TypeDoc organizes children of a
documentation item.

## @group

**Tag Kind:** [Block](../tags.md#block-tags)

The `@group` tag can be used to place several related API items under a common
header when listed in a page's index. It may be specified multiple times to list
a reflection under several headings.

Unlike the [`@category`](category.md) tag, reflections will be automatically
placed under a header according to their kind if the `@group` tag is not
specified. This tag can be used to simulate custom member types.

### Example

```ts
/**
 * @groupDescription Events
 * Events are for...
 * @showGroups
 */
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

## @groupDescription

The `@groupDescription` block tag can be used to provide additional context
about a group of reflections. TypeDoc automatically groups reflections according
to their TypeScript kind, but custom groups can be created with the `@group`
tag.

The `@groupDescription` tag should be placed in the comment for the reflection
which contains the group of child reflections.

The first line of the `@groupDescription` will be taken as the group name, and
following lines will be used for the description.

## Navigation Customization

Groups can be added to the navigation tree with the `navigation.includeGroups`
option. This can be selectively enabled or disabled by specifying the
`@showGroups` and `@hideGroups` modifier tags within the comment on the parent
reflection. These tags have no effect within the page contents.

## @disableGroups

The `@disableGroups` tag can be used to selectively disable TypeDoc's grouping
mechanism on a per-parent basis. This is recommended only for documentation
sites which contain a small number of members.

Note: A corresponding `@disableCategories` tag does not exist as categories are
only created if explicitly requested by including `@category` on at least one
child of the parent.

```ts
/**
 * This is a very small module where separating members into groups by type
 * doesn't make sense.
 * @module
 * @disableGroups
 */

export const variable = 123;

export function fn() {}
```

## See Also

- The [`@category`](category.md) tag
- The [`--searchGroupBoosts`](../options/output.md#searchgroupboosts) option
- The [`--navigation.includeGroups`](../options/output.md#navigation) option
