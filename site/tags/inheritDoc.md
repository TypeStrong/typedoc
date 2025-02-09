---
title: "\{\@inheritDoc\}"
---

**Tag Kind:** [Inline](../tags.md#inline-tags) / [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@inheritDoc](https://tsdoc.org/pages/tags/inheritDoc/)

The `@inheritDoc` tag is used to create a reflection's documentation by copying it from another
reflection. The tag has the form `{@inheritDoc ref}` where `ref` is a
[declaration reference](../declaration-references.md).

## Copied Elements

The `@inheritDoc` tag, following the TSDoc specification, will only copy the following parts
of a comment:

- The summary
- The `@remarks` block
- Any `@param` blocks
- Any `@typeParam` Blocks
- The `@returns` block

## Example

```ts
/**
 * Some documentation
 */
export class SomeClass {}

/** {@inheritDoc SomeClass} */
export interface SomeUnrelatedClass {}
```

## TSDoc Compatibility

The TSDoc standard states that the `@inheritDoc` tag is an inline tag. This conflicts with
JSDoc's usage, which expects it to be present without wrapping braces. TypeDoc will parse
both `{@inheritDoc}` and `@inheritDoc`. When present without braces, TypeDoc will inherit
comments from the "parent" reflection if possible.

## See Also

- JSDoc's [`@inheritdoc`](https://jsdoc.app/tags-inheritdoc.html)
