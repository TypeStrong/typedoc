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

Note: TypeDoc only supports fenced code blocks. Indentation based code blocks will not prevent tags
from being parsed within the code block.

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

## See Also

-   The [Tags overview](../tags.md)
-   The [Declaration References](../declaration-references.md) guide
-   The [TSDoc](https://tsdoc.org/) website
