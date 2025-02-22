---
title: "@template"
---

# @template

**Tag Kind:** [Block](../tags.md#block-tags)

The `@template` tag is used to document a type parameter of a function, method, class, interface or type alias.

TypeDoc recognizes the `@template` tag as an alias of `@typeParam` for compatibility with JavaScript
projects using TypeScript via doc comments. For TypeScript projects, the TSDoc standard
[`@typeParam`](typeParam.md) tag should be preferred.

## Example

```js
/**
 * @template {string} T - the identity type
 */
export function identity<T>(x) {
    return x;
}
```

## See Also

- The [`@typeParam`](typeParam.md) tag
