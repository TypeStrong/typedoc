---
title: "@document"
---

# @document

**Tag Kind:** [Block](../tags.md#block-tags)

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

- The [`projectDocuments`](../options/input.md#projectdocuments) option
