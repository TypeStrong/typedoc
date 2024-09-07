---
title: "@document"
---

# @document

**Tag Kind:** [Block](../tags.md#Block-Tags)

Instructs TypeDoc to include the path specified in the tag content as a document
within the generated site. See the [External Documents](../external-documents.md) guide
for more details.

## Example

```ts
/**
 * @document promise-tutorial.md
 */
export class Promise<T> {
    // ...
}
```

## See Also

-   The [`projectDocuments`](../options/input.md#projectDocuments) option
