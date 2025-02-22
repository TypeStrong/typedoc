---
title: "@eventProperty"
---

# @eventProperty

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@eventProperty](https://tsdoc.org/pages/tags/eventProperty/)

The `@eventProperty` tag is used to mark a reflection as belonging in the "Events" group.
It is equivalent to specifying `@group Events` in the comment.

## Example

```ts
export class App extends EventEmitter {
    /**
     * @eventProperty
     */
    static ON_REQUEST = "request";
}
```

## See Also

- The [`@group`](group.md) tag
- The [`@event`](event.md) tag
