---
title: "@defaultValue"
---

# @defaultValue

**Tag Kind:** [Block](../tags.md#block-tags) <br>
**TSDoc Reference:** [@defaultValue](https://tsdoc.org/pages/tags/defaultValue/)

The `@defaultValue` tag can be used to document the default value for an accessor or property.
TypeDoc also recognizes the commonly used alternative `@default` block tag.

The default theme does not attach special behavior to this tag, displaying its contents under
a `# Default Value` header like other block tags.

## Example

```ts
export interface CompilerOptions {
    strict?: boolean;
    /**
     * @defaultValue `true` if `strict` is `true`, otherwise `false`
     */
    strictNullChecks?: boolean;
}
```
