---
title: "@inline"
---

# @inline

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@inline` tag may be placed on type aliases and interfaces. When a type is
annotated with `@inline` and the type is referenced, TypeDoc will attempt to inline
the referenced type within the other type.

> Note: Use of this tag can _significantly_ increase the size of your generated
> documentation if it is applied to commonly used types as it will result in
> inlining the comments for those types everywhere they are referenced.

## Example

```tsx
/**
 * @inline
 */
export type HelloProps = {
    /** Name property docs */
    name: string;
};

/**
 * Hello component
 */
export function Hello(props: HelloProps) {
    return <span>Hello {props.name}!</span>;
}
```

## See Also

-   The [`@expand`](expand.md) tag
