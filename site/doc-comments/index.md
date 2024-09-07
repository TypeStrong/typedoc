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
[`--lightHighlightTheme`](../options/output.md#lightHighlightTheme) and
[`--darkHighlightTheme`](../options/output.md#darkHighlightTheme) options.

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

## TSDoc Compliance

The TSDoc standard is a proposal to standardize parsing of JSDoc-like comments. TypeDoc aims to be
compliant with the TSDoc standard, but does not enforce it. This means that while TypeDoc should be able
to parse all (or nearly all) TSDoc-complaint comments, it does not require that your comments follow the standard.

This approach has several benefits, including better support for projects originally written using JSDoc and
support for more markdown constructs (including day-to-day features like
[headings](https://github.com/microsoft/tsdoc/issues/197), and
[lists](https://github.com/microsoft/tsdoc/issues/178)). However, for projects requiring stricter validation
of comment formats, this laxness may not be acceptable. In this case, [api-extractor](https://api-extractor.com/)
is recommended instead of TypeDoc for it's much stricter conformance to TSDoc.

## JSDoc Compliance

JSDoc is the de-facto "standard" for comments, but does not specify a rigorous grammar and is fully implemented
only by the official JSDoc tool. TypeDoc aims to recognize _most_ JSDoc comments in a manner similar to how they
are handled by TypeScript and Visual Studio Code. Where the JSDoc implementation conflicts with the TSDoc specification,
TypeDoc generally tries to detect which implementation is intended. JSDoc compatibility can be controlled with
the [--jsDocCompatibility](../options/comments.md#jsDocCompatibility) option.

## See Also

-   The [Tags overview](../tags.md)
-   The [Declaration References](../declaration-references.md) guide
-   The [TSDoc](https://tsdoc.org/) website
