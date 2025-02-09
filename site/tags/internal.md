---
title: "@internal"
---

# @internal

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@internal](https://tsdoc.org/pages/tags/internal/)

The `@internal` tag indicates that a reflection is not intended to be used by API consumers.
API items annotated with `@internal` may be removed from the generated documentation by specifying
the `--excludeInternal` option.

## Example

```ts
export class Visibility {
    /** @internal */
    member = 123;
}
```

## See Also

- The [`@alpha`](alpha.md) tag
- The [`@beta`](beta.md) tag
- The [`@experimental`](experimental.md) tag
- The [`--excludeInternal`](../options/input.md#excludeinternal) option
- The [`--stripInternal`](https://www.typescriptlang.org/tsconfig#stripInternal) TypeScript compiler option
