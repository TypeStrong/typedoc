# The TypeDoc Example

Welcome to the TypeDoc example! TypeDoc is a documentation generator for
TypeScript.

TypeDoc automatically documents every variable, function, and class
that is exported by your project. You can add explanations and examples to your
documentation site by annotating your code with doc comments, e.g.

```
/**
 * Calculates the square root of a number.
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

Click the **Exports** link in the sidebar to see an index of everything in the package.

## Highlighted Examples

TODO
