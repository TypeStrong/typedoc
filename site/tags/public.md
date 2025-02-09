---
title: "@public"
---

# @public

**Tag Kind:** [Modifier](../tags.md#modifier-tags) <br>
**TSDoc Reference:** [@public](https://tsdoc.org/pages/tags/public/)

This tag should generally not be used. The `@public` tag overrides the visibility of a reflection to be public.
This does not strictly conform to the TSDoc specification, which treats member visibility and release
visibility separately.

## Example

```ts
export class Visibility {
    /** @public */
    protected member = 123;
}

// Will be documented as:
export class Visibility {
    public member = 123;
}
```

## TSDoc Compatibility

The TSDoc standard specifies that the `@public` designation should be inherited by contained members.
TypeDoc does not display the `@public` badge to all contained members, only showing it on the annotated member.
Furthermore, TypeDoc's implementation of the `@public` tag changes the effective visibility of a member
for backwards compatibility, which is not specified.

API authors are encouraged to treat all exported members as public if not explicitly annotated with `@alpha`,
`@beta`, `@experimental`, or `@internal` and not specify this tag.

## See Also

- The [`@alpha`](alpha.md) tag
- The [`@beta`](beta.md) tag
- The [`@experimental`](experimental.md) tag
- The [`@internal`](internal.md) tag
- The [`@private`](private.md) tag
- The [`@protected`](protected.md) tag
