---
title: Doc Comments
children:
    - jsdoc-support.md
    - tsdoc-support.md
---

# Doc Comments

TypeDoc implements a minimal parser for your comments which extracts TSDoc/JSDoc tags and recognizes code
blocks to ignore decorators. The resulting markup after resolving tags is then passed to the [markdown-it](https://github.com/markdown-it/markdown-it)
markdown parser to be converted to HTML.

```ts
/**
 * This comment _supports_ [Markdown](https://www.markdownguide.org/)
 */
export class DocumentMe {}
```

TypeDoc will ignore comments containing `@license` or `@import`.

## Code Blocks

TypeDoc supports code blocks in markdown and uses
[Shiki](https://shiki.matsu.io/) to provide syntax highlighting. You can specify
the syntax highlighting theme with the
[`--lightHighlightTheme`](../options/output.md#lighthighlighttheme) and
[`--darkHighlightTheme`](../options/output.md#darkhighlighttheme) options.
TypeDoc only loads some of the languages supported by Shiki by default. If you
want to load additional languages, use the
[`highlightLanguages`](../options/output.md#highlightlanguages) option.

````ts
/**
 * Code blocks are great for examples
 *
 * ```ts
 * // run typedoc --help for a list of supported languages
 * const instance = new MyClass();
 * ```
 */
export class MyClass {}
````

> [!note]
> TypeDoc only supports fenced code blocks. Indentation based code blocks will not prevent tags
> from being parsed within the code block.

## Escaping Comments

TypeDoc supports escaping special characters in comments to include literal `{}@/` characters.
All other escapes will be passed through to be processed by markdown-it. As an example:

````ts
/**
 * This is not a \@tag. Nor is this an \{\@inlineTag\}
 *
 * It is possible to escape the end of a comment:
 * ```ts
 * /**
 *  * docs for `example()`
 *  *\/
 * function example(): void
 * ```
 */
````

Will be rendered as:

> This is not a \@tag. Nor is this an \{\@inlineTag\}
>
> It is possible to escape the end of a comment:
>
> ```ts
> /**
>  * docs for `example()`
>  */
> function example(): void;
> ```

## Comment Discovery

In most cases, TypeDoc's comment discovery closely mirrors TypeScript's discovery. If a comment is placed
directly before a declaration or typically belongs to a declaration but lives on a parent node, TypeDoc
will include it in the documentation.

```ts
/**
 * This works
 * @param x this works
 */
function example(x: string, /** This too */ y: number) {}
/** This also works */
class Example2 {}
```

TypeDoc also supports discovering comments in some locations which TypeScript does not.

1. Comments on type aliases directly containing unions may have comments before each union branch
   to document the union.

   ```ts
   type Choices =
       /** Comment for option 1 */
       | "option_1"
       /** Comment for option 2 */
       | { option_1: number };
   ```

2. Comments on export specifiers which export (or re-export) a member.

   ```ts
   /** A comment here will take precedence over a module comment in Lib */
   export * as Lib from "lib";
   ```

   Comments on export specifiers only have higher priority than the module comment for modules
   and references where the symbol appears in the documentation multiple times.

   ```ts
   export * as Lib from "lib"; // Use the @module comment
   /** Preserved for backwards compatibility, prefer {@link Lib} */
   export * as Library from "lib";

   /** This comment will be used for someFunction only if someFunction does not have a comment directly on it */
   export { someFunction } from "lib";
   ```

## See Also

- The [Tags overview](../tags.md)
- The [Declaration References](../declaration-references.md) guide
- The [TSDoc](https://tsdoc.org/) website
