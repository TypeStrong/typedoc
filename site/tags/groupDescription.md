---
title: "@groupDescription"
---

# @groupDescription

**Tag Kind:** [Block](../tags.md#block-tags)

The `@groupDescription` tag can be used to provide additional context about a group of reflections.
TypeDoc automatically groups reflections according to their TypeScript kind, but custom groups can
be created with the [`@group`](group.md) tag.

The `@groupDescription` tag should be placed in the comment for the reflection which contains the
group of child reflections.

The first line of the `@groupDescription` will be taken as the group name, and following lines will
be used for the description.

## Example

```ts
/**
 * @groupDescription Events
 * Events are for...
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

## See Also

-   The [`@group`](group.md) tag
-   The [`@category`](category.md) tag
-   The [`@categoryDescription`](categoryDescription.md) tag
-   The [`--searchGroupBoosts`](../options/output.md#searchgroupboosts) option
