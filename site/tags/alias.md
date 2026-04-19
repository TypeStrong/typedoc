---
title: "@alias"
---

# @alias

**Tag Kind:** [Modifier](../tags.md#modifier-tags)

The `@alias` tag is valid on type alias and variable declarations which directly reference another
symbol. When present, it instructs TypeDoc that the variable it is present on should be treated as
if it was a re-export of the referenced symbol rather than being converted directly.

> [!note]
> It should generally be preferred to use real re-exports to construct your public API instead
> of introducing new symbols with type aliases or variables. Using real re-exports will result
> in a better developer experience for consumers of your library using Go To Definition to navigate
> within your library.


## Example

Assuming that `Vector` in `utils.js` is declared as a class, this will cause TypeDoc to convert
the `Math` namespace as if the `Vector` class was declared directly within the namespace rather than
being imported from another file. Similarly, the `IsInt` type alias will be treated as a re-export.

```ts
import { Vector as _Vector, IsInt as _IsInt } from "./utils.js"

export namespace Math {
    /** @alias */
    export const Vector = _Vector;
    export type Vector = typeof _Vector;

    /** @alias */
    export type IsInt<T extends number> = _IsInt<T>;

    // The following are all invalid usage of the @alias tag and will produce a warning
    /** @alias */
    export type BadAlias1 = 123;
    /** @alias */
    export const BadAlias2 = { someImportedFunction };
}
```

## See Also

- The [`@inline`](inline.md) tag
