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
-   Syntax highligting in code blocks

## Index of Examples

**Click the "Exports" link in the sidebar to see a complete list of everything in
the package.**

Here are some examples we wanted to highlight:

### Rendering

-   Markdown showcase: [[`markdownShowcase`]]
-   Syntax highlighting showcase: [[`syntaxHighlightingShowcase`]]

### Functions

-   Simple functions: [[`sqrt`]] and [[`sqrtArrowFunction`]]
-   A generic function: [[`concat`]]
-   Functions that take an options object: [[`makeHttpCallA`]] and [[`makeHttpCallB`]]
-   An overloaded function: [[`overloadedFunction`]]
-   An external function exported under a different name: [[`lodashSortBy`]]

### Types

-   Type aliases: [[`SimpleTypeAlias`]] and [[`ComplexGenericTypeAlias`]]
-   Interfaces: [[`User`]] and [[`AdminUser`]]

### Classes

-   A basic class: [[`Customer`]]
-   A subclass: [[`DeliveryCustomer`]]
-   A complex class: [[`CancellablePromise`]]
-   A class that extends a built-in generic type: [[`StringArray`]]

### Enums

-   A basic enum: [[`SimpleEnum`]]
-   Using the `@enum` tag: [[`EnumLikeObject`]]

### Variables

-   [[`PI`]], [[`STRING_CONSTANT`]], and [[`ObjectConstant`]]

### React Components

-   Basic React components: [[`CardA`]] and [[`CardB`]]
-   A complex React component: [[`EasyFormDialog`]] and [[`EasyFormDialogProps`]]
