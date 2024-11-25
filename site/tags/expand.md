---
title: "@expand"
---

# @expand

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@expand` tag may be placed on type aliases and interfaces. When a type is
annotated with `@expand`, TypeDoc will inline the type declaration of that type
wherever it is referenced and TypeDoc has a place to include it.

> Note: Use of this tag can _significantly_ increase the size of your generated
> documentation if it is applied to commonly used types as it will result in
> inlining the comments for those types everywhere they are referenced.

## Example

This is particularly useful for React components, where the documentation for
props is useful when viewing the component function. The `Hello` component below
will take the description "Props docs" from `HelloProps` for its `props`
parameter and also render details about the referenced type.

The `Hello2` component behaves similarly, but provides a more relevant
description for the overall type, which prevents the summary provided in
`HelloProps` from being used.

```tsx
/**
 * Props docs
 * @expand
 */
export type HelloProps = {
    /** Name property docs */
    name: string;
};

/**
 * Hello
 */
export function Hello(props: HelloProps) {
    return {};
}

/**
 * Hello2
 * @param props Props docs (used instead of `@expand` description)
 */
export function Hello2(props: HelloProps) {
    return {};
}
```

## See Also

-   The [`@inline`](inline.md) tag
