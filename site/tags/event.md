---
title: "@event"
---

# @event

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@event` tag is used to mark a reflection as belonging in the "Events" group.
It is equivalent to specifying `@group Events` in the comment.

## Example

```ts
export class App extends EventEmitter {
    /**
     * @event
     */
    static ON_REQUEST = "request";
}
```

## See Also

- The [`@group`](group.md) tag
- The [`@eventProperty`](eventProperty.md) tag
