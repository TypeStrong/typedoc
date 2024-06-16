---
title: Markdown Showcase
category: Documents
---

# Markdown Showcase

All comments are parsed as **Markdown**. TypeDoc uses the
[markdown-it](https://github.com/markdown-it/markdown-it) markdown parser to _convert
comments to HTML_.

TypeDoc also supports including arbitrary Markdown documents in your site. These can be top level
documents added with the `--projectDocuments` option or added with the `@document` tag.

## Symbol References

You can link to other classes, members or functions using an inline link tag. See the [TypeDoc
documentation](https://typedoc.org/tags/link/) for
details.

## Code in Doc Comments

Some inline code: `npm install --save-dev typedoc`

A TypeScript code block:

```
// A fabulous variable
const x: number | string = 12
```

See {@link syntaxHighlightingShowcase | `syntaxHighlightingShowcase`} for more code blocks.

## A List

-   🥚 ~~Eggs~~
-   🍞 Bread
-   🧀 Swiss cheese

## A Table

| Package | Version |
| ------- | ------- |
| lodash  | 4.17.21 |
| react   | 17.0.2  |
| typedoc | 0.22.4  |

A Random Shakespeare Quote

---

> Rebellious subjects, enemies to peace, Profaners of this neighbour-stained
> steel,-- Will they not hear? What, ho! you men, you beasts, That quench the
> fire of your pernicious rage With purple fountains issuing from your veins

## An Image

 <img src="../../media/typescript-logo.svg" width="120" />
