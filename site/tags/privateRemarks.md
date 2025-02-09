---
title: "@privateRemarks"
---

# @privateRemarks

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@privateRemarks](https://tsdoc.org/pages/tags/privateRemarks/)

The `@privateRemarks` tag can be used to include documentation text that should not be included
in the generated API reference.

## Example

```ts
/**
 * Some docs here
 *
 * @privateRemarks
 * Implementation detail notes not useful to the API consumer
 */
export function rand(): number;
```

## TSDoc Compatibility

TypeDoc will omit this tag from the documentation by default, but the user is responsible for including it in
the `--excludeTags` list if it is set.

## See also

- The [`@remarks`](remarks.md) tag
- The [`--excludeTags`](../options/comments.md#excludetags) option
