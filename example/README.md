# The TypeDoc Example

Welcome to the TypeDoc example! TypeDoc is a documentation generator for
TypeScript.

TypeDoc automatically documents every variable, function, and class
that is exported by your project. You can add explanations and examples to your
documentation site by annotating your code with doc comments, e.g.

```
/**
 * Calculates the square root of a number.
 *
 * @param x the number to calculate the root of.
 * @returns the square root if `x` is non-negative or `NaN` if `x` is negative.
 */
export function sqrt(x: number): number {
    return Math.sqrt(x);
}
```

This project shows off some of TypeDoc's features:

-   Built-in support for various TypeScript language constructs
-   Markdown in doc comments
-   Syntax highlighting in code blocks

## Index of Examples

**Click the "Exports" link in the sidebar to see a complete list of everything in
the package.**

Here are some examples we wanted to highlight:

### Rendering

-   External Markdown: [here](./src/documents/external-markdown.md)
-   Markdown showcase: [here](./src/documents/markdown.md)
-   Syntax highlighting showcase: [here](./src/documents/syntax-highlighting.md)

### Functions

-   Simple functions: {@link sqrt | `sqrt` } and {@link sqrtArrowFunction | `sqrtArrowFunction` }
-   A generic function: {@link concat | `concat` }
-   Functions that take an options object: {@link makeHttpCallA | `makeHttpCallA` } and {@link makeHttpCallB | `makeHttpCallB` }
-   An overloaded function: {@link overloadedFunction | `overloadedFunction` }
-   An external function exported under a different name: {@link lodashSortBy | `lodashSortBy` }

### Types

-   Type aliases: {@link SimpleTypeAlias | `SimpleTypeAlias` } and {@link ComplexGenericTypeAlias | `ComplexGenericTypeAlias` }
-   Interfaces: {@link User | `User` } and {@link AdminUser | `AdminUser` }

### Classes

-   A basic class: {@link Customer | `Customer` }
-   A subclass: {@link DeliveryCustomer | `DeliveryCustomer` }
-   A complex class: {@link CancellablePromise | `CancellablePromise` }
-   A class that extends a built-in generic type: {@link StringArray | `StringArray` }

### Enums

-   A basic enum: {@link SimpleEnum | `SimpleEnum` }
-   Using the `@enum` tag: {@link EnumLikeObject | `EnumLikeObject` }

### Variables

-   {@link PI | `PI` }, {@link STRING_CONSTANT | `STRING_CONSTANT` }, and {@link ObjectConstant | `ObjectConstant` }

### React Components

-   Basic React components: {@link CardA | `CardA` } and {@link CardB | `CardB` }
-   A complex React component: {@link EasyFormDialog | `EasyFormDialog` } and {@link EasyFormDialogProps | `EasyFormDialogProps` }
