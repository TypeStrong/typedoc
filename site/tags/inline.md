---
title: "@inline"
---

# Inline Tags

The `@inline`, `@inlineType` and `@preventInline` tags can be used to control how
TypeDoc converts references to type aliases and interfaces.

## @inline

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@inline` tag may be placed on type aliases and interfaces. When a type is
annotated with `@inline` and the type is referenced, TypeDoc will attempt to inline
the referenced type within the other type. TypeDoc is unable to inline some types,
notably type references with type parameters in some cases, and may make incorrect
guesses about the shape of types which aren't object literals, unions, intersections,
or literals. Please report a bug if `@inline` incorrectly converts a type.

> [!note]
> Use of this tag can _significantly_ increase the size of your generated
> documentation if it is applied to commonly used types as it will result in
> inlining the comments for those types everywhere they are referenced.

### Example

```tsx
/**
 * @inline
 */
export type HelloProps = {
    /** Name property docs */
    name: string;
};

/**
 * Hello component - HelloProps will be inlined here as
 * if you had written `Hello(props: { name: string })`
 */
export function Hello(props: HelloProps) {
    return <span>Hello {props.name}!</span>;
}
```

## @inlineType

**Tag Kind:** [Block](../tags.md#block-tags)

The `@inlineType` block tag can be used to selectively inline a type reference
without inlining it everywhere. It should specify the type name without type
arguments.

### Example

```ts
export type HelloProps = {
    name: string;
};

/**
 * Hello component - HelloProps will be inlined here as
 * if you had written `Hello(props: { name: string })`
 * @inlineType HelloProps
 */
export function Hello(props: HelloProps) {
    return <span>Hello {props.name}!</span>;
}
```

## @preventInline

**Tag Kind:** [Block](../tags.md#block-tags)

The `@preventInline` block tag can be used to instruct TypeDoc to not inline a
tag which has been inlined with `@inline` or `@preventInline`. Note that TypeDoc
will be unable to produce a type reference instead of an inlined type if
TypeScript does not produce a named reference to begin with. If you remove
`@inline` and the type is still inlined in your type, `@preventInline` cannot
prevent the expansion.

### Example

```tsx
/**
 * @inline
 */
export type HelloProps = {
    /** Name property docs */
    name: string;
};

/**
 * Hello component - HelloProps will NOT be inlined here
 * @preventInline HelloProps
 */
export function Hello2(props: HelloProps) {
    return <span>Hello {props.name}!</span>;
}
```

## See Also

- The [`@expand`](expand.md) tags
