---
title: "@class"
---

# @class

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

If present on a variable, will cause it to be converted as a class. This
will result in all "dynamic" properties being expanded to real properties.

TypeDoc will also ignore types/interfaces declared with the same name as
variables annotated with `@class`.

If the constructor function has more than one overload, TypeDoc will use
the return type for the first overload to determine the shape of the class.

If the constructor function is generic, the type parameters will be lifted
up from the constructor function to become class type parameters.

## Example

```ts
/** @class */
export function ClassLike() {
    if (new.target) {
        //
    }
}
```

## See Also

- The [`@interface`](interface.md) tag
