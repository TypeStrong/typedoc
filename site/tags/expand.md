---
title: "@expand"
---

# Expand Tags

The `@expand`, `@expandType`, and `@preventExpand` tags can be used to control
how TypeDoc _displays_ references to type aliases and interfaces.

## @expand

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@expand` tag may be placed on type aliases and interfaces. When a type is
annotated with `@expand`, TypeDoc will inline the type declaration of that type
wherever it is referenced and TypeDoc has a place to include it.

> [!note]
> Use of this tag can _significantly_ increase the size of your generated
> documentation if it is applied to commonly used types as it will result in
> inlining the comments for those types everywhere they are referenced.

### Example

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

## @expandType

**Tag Kind:** [Block](../tags.md#block-tags)

The `@expandType` can be placed on any reflection to tell TypeDoc to expand a type
reference when rendering it within that reflection. It should specify the type name
without type arguments.

`@expandType` is inherited, it may be placed on a namespace or module where there are
multiple references to a type to instruct TypeDoc to expand the type everywhere in that
module.

### Example

TypeDoc will expand `HelloProps` within `Hello` as if `@expand` had been placed
on `HelloProps`.

```ts
export type HelloProps = {
    /** Name description */
    name: string;
};

/**
 * Hello component
 * @expandType HelloProps
 */
export function Hello(props: HelloProps) {
    return <span>Hello {props.name}!</span>;
}
```

## @preventExpand

**Tag Kind:** [Block](../tags.md#block-tags)

The `@preventExpand` block tag can be used to instruct TypeDoc to not expand a
tag which has been expanded with `@expand`, `@preventExpand`, or by highlighting
properties of the reference type with `@param`.

```tsx
/**
 * @expand
 */
export type HelloProps = {
    /** Name property docs */
    name: string;
};

/**
 * Hello component - HelloProps will NOT be expanded here
 * @preventExpand HelloProps
 */
export function Hello2(props: HelloProps) {
    return <span>Hello {props.name}!</span>;
}
```

## See Also

- The [`@inline`](inline.md) tags
- The [`@param`](param.md) tag
